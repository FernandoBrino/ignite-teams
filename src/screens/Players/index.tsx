import { useState, useEffect, useRef } from "react";
import { Alert, FlatList, TextInput } from "react-native";
import { useRoute } from "@react-navigation/native";

import { Highlight } from "@components/Highlight";
import { ButtonIcon } from "@components/ButtonIcon";
import { Input } from "@components/Input";
import { Header } from "@components/Header";
import { Filter } from "@components/Filter";
import { PlayerCard } from "@components/PlayerCard";
import { ListEmpty } from "@components/ListEmpty";
import { Button } from "@components/Button";
import { playerAddByGroup } from "@storage/player/playerAddByGroup";
import { AppError } from "@utils/AppError";
import { playersGetByGroupAndTeam } from "@storage/player/playerGetByGroupAndTeam";
import { PlayerStorageDTO } from "@storage/player/PlayerStorageDTO";

import { Container, Form, HeaderList, NumbersOfPlayers } from "./styles";

type RouteParams = {
    group: string;
}

export function Players() {
    const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);
    const [newPlayerName, setNewPlayerName] = useState<string>('');
    const [team, setTeam] = useState<string>('Time A');

    const route = useRoute();
    const { group } = route.params as RouteParams;

    const newPlayerNameInputRef = useRef<TextInput>(null)

    async function handleAddPlayer() {
        if(newPlayerName.trim().length === 0) {
            return Alert.alert("Nova Pessoa", "Informe o nome da pessoa para adicionar.")
        }

        const newPlayer = {
            name: newPlayerName,
            team
        }

        try {
            await playerAddByGroup(newPlayer, group)

            newPlayerNameInputRef.current?.blur();
            
            setNewPlayerName('')
            fetchPlayersByTeam();
        } catch (error) {
            if(error instanceof AppError) {
                Alert.alert("Nova Pessoa", error.message)
            } else {
                Alert.alert("Nova Pessoa", "Não foi possível adicionar.");
                console.log(error)
            }
        }
    }


    async function fetchPlayersByTeam() {
        try {
            const playersByTeam = await playersGetByGroupAndTeam(group, team)
            setPlayers(playersByTeam)
        } catch (error) {
            console.log(error)
            Alert.alert("Pessoas", "Não foi possível carregar as pessoas filtradas do time selecionado.")
        }
    }

    useEffect(() => {
        fetchPlayersByTeam();
    }, [team])

    return (
        <Container> 
            <Header showBackButton/>

            <Highlight 
                title={group}
                subtitle="adicione a galera e separe os times"
            />

            <Form>
                <Input 
                    inputRef={newPlayerNameInputRef}
                    onChangeText={setNewPlayerName}
                    value={newPlayerName}
                    placeholder="Nome da pessoa"
                    autoCorrect={false}
                    onSubmitEditing={handleAddPlayer}
                    returnKeyType="done"
                />
                <ButtonIcon 
                    icon="add"
                    onPress={handleAddPlayer}
                />
            </Form>

            <HeaderList> 
                <FlatList 
                    data={['Time A', 'Time B']}
                    keyExtractor={item => item}
                    renderItem={({item}) => (
                        <Filter 
                            title={item}
                            isActive={item === team}
                            onPress={() => setTeam(item)}
                        />
                    )}
                    horizontal
                />

                <NumbersOfPlayers>
                    {players.length}
                </NumbersOfPlayers>
            </HeaderList>
            
            <FlatList 
                data={players}
                keyExtractor={item => item.name}
                renderItem={({ item }) => (
                    <PlayerCard 
                        name={item.name} 
                        onRemove={() => {}}
                    />
                )}
                ListEmptyComponent={() => (
                    <ListEmpty 
                      message="Não há pessoas nesse time." 
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    { paddingBottom: 100 },
                    players.length === 0 && { flex: 1 }
                ]}
            />

            <Button 
                title="Remover turma"
                type="SECONDARY"
            />
        </Container>
    )
}