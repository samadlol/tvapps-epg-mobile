import React, { useCallback, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { getStartDayTimestamp, formatDay } from '../../util';
import { TV_GUIDE_CONSTANTS } from '../../constants';

const ItemList = ({ data, dateSelected, onDateFilterChanged }) => {
    const onDateSelecteChanged = useCallback(() => {

        onDateFilterChanged(data.date);
    }, []);


    let title = null;
    let isActive = false;
    if (getStartDayTimestamp(new Date(data.date)) === getStartDayTimestamp(dateSelected)) {
        isActive = true;
    }
    if (getStartDayTimestamp(new Date(data.date)) === getStartDayTimestamp(new Date())) {
        title = TV_GUIDE_CONSTANTS.TODAY_TEXT
    } else {
        title = formatDay(data?.date);
    }

    return (
        <View style={styles.itemContainer}>
            <TouchableOpacity onPress={onDateSelecteChanged}>
                <Text style={[styles.itemTextDate, { backgroundColor: isActive ? TV_GUIDE_CONSTANTS.THEME_STYLES.PROGRAM_TIME_START_BG_COLOR : 'transparent', borderRadius: isActive ? 2 : 0 }]}>
                    {title}
                </Text>
            </TouchableOpacity>
        </View>
    )

};

export default function ListFilter(props) {
    const { data, dateSelected, onDateFilterChanged } = props;
    if (!data || data.length === 0) {
        return null;
    }

    const scrollRef = useRef(null);

    const renderItem = useCallback(({ item }) => {
        return <ItemList key={item.key} data={item} dateSelected={dateSelected} onDateFilterChanged={onDateFilterChanged} />
    }, [dateSelected]);

    const getKeyExtactor = useCallback((item, index) => {
        return item.key;
    }, []);

    const getItemLayout = useCallback((data, index) => (
        {
            length: TV_GUIDE_CONSTANTS.ITEM_FILTER_HEADER_WIDTH,
            offset: TV_GUIDE_CONSTANTS.ITEM_FILTER_HEADER_WIDTH * index,
            index,
        }
    ), []);

    useEffect(() => {
        try {
            const indexSeleted = data.findIndex(item => getStartDayTimestamp(item.date) === getStartDayTimestamp(dateSelected));
            if (indexSeleted !== -1) {
                scrollRef?.current?.scrollToIndex({ animated: true, index: indexSeleted })
            }

        } catch (e) {
            return e;
        }

    }, [dateSelected]);

    return (
        <View style={styles.filterContainer}>
            <FlatList
                scrollEnabled={true}
                ref={scrollRef}
                horizontal
                data={data}
                renderItem={renderItem}
                keyExtractor={getKeyExtactor}
                getItemLayout={getItemLayout}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    filterContainer: {
        width: '100%',
        height: 36,
        paddingHorizontal: 10,
        alignContent: 'center',
    },
    itemContainer: {
        width: TV_GUIDE_CONSTANTS.ITEM_FILTER_HEADER_WIDTH,
        justifyContent: 'center',
        alignContent: 'center',
        fontWeight: 'bold',
    },
    itemTextDate: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 18
    }
})
