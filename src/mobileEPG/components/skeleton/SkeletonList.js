import { View, Text, FlatList, StyleSheet } from 'react-native';
import React, { useCallback } from 'react';
import SkeletonComponent from './SkeletonComponent';

export default function SkeletonList(props) {
    const { height, size, channeListWidth, programListWidth, } = props;

    const genereData = useCallback(() => {
        let list = [];
        for (let i = 0; i < size; i++) {
            list.push(i);
        }
        return list;
    }, [size]);


    const dataSkeleton = genereData();

    const renderItem = useCallback(() => {
        return (
            <View style={styles.flexRow}>
                <SkeletonComponent height={height} width={channeListWidth} style={{ marginRight: 8 }} />
                <SkeletonComponent height={height} width={programListWidth} />
            </View>
        )
    }, []);

    const keyExtractor = useCallback((item, index) => {
        return index.toString()
    }, []);


    return (
        <View style={styles.skeletonListContainer}>
            <FlatList
                data={dataSkeleton}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    skeletonListContainer: {
        flex: 1,
    },
    flexRow: {
        flexDirection: 'row',
    }
})
