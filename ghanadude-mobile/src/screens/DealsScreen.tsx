import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const deals = [
    { id: '1', title: 'Deal 1', description: 'Description for deal 1' },
    { id: '2', title: 'Deal 2', description: 'Description for deal 2' },
    { id: '3', title: 'Deal 3', description: 'Description for deal 3' },
];

const DealsScreen = () => {
    const renderItem = ({ item }: { item: { id: string; title: string; description: string } }) => (
        <View style={styles.dealItem}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={deals}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    dealItem: {
        padding: 16,
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
});

export default DealsScreen;