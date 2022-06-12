## EPG Component for React Native applications.




### React Native TV Guide Mobile


![Default UI screenshoot](https://user-images.githubusercontent.com/90168097/149857830-81c19408-b621-4f0a-8b8b-e4017f067df5.jpg)

### About

- [x] EPG component
    - Material design similar to Mobile's Live Channels app
    - Supports extended data fields (channel logos, programme series/episode information, programme images, etc) 
    - Supports custom actions for programmes (e.g. Open in BBC iPlayer)
    - Renderer support:
        - [x] Support React Native 
        - [x] Support using a custom colour scheme
        - [x] Support callback function to get program selected
        - [x] Support slient load more programs by date
        - [x] Hooks for loading additional data when scrolling to the end of the loaded data
        - [x] Shows the current and next programme and it's start time
    
 
### Install:   
    Note: You must be using React Native 0.60.0 or higher and import two libraries use the  react-native-fast-image and react-native-uuid.

```js
yarn add tvapps-epg-mobile
yarn add react-native-uuid
yarn add react-native-fast-image
```

### Data
---

Data is provided in formats defined.
After fetch data from API, please parse them to Model with: ChannelModel,ProgramItemModel,ProgramModel:
```js
import { processProgramsData, compareTwoDates, ChannelModel, ProgramItemModel, ProgramModel } from 'tvapps-epg-mobile';

//channel reducer: 
case ActionTypes.FETCH_CHANNELS_SUCCESS: {
            const channelList = [];
            const { channels } = payload || [];
            if (channels && channels.length > 0) {
                channels.map(item => {
                    const channelModel = new ChannelModel();
                    item.imageSrc = processChannelAttachments(item);
                    channelModel.unSerialize(item);
                    channelList.push(channelModel);
                });
            }

            return {
                ...state,
                fetchingChannels: false,
                channelList: [...state.channelList, ...channelList],
            };
        }
     
 // program reducer

case ActionTypes.FETCH_PROGRAMS_SUCCESS: {
            try {
                const { data, date } = payload || [];
                data.map(channelPrograms => {
                    const { programs } = channelPrograms;
                    programs.map(programItem => {
                        const programItemModel = new ProgramItemModel();
                        programItem.imageSrc = processProgramAttachments(programItem);
                        return programItemModel.unSerialize(programItem);
                    });
                    const programModel = new ProgramModel(channelPrograms.channelExternalId, programs);
                    return programModel;
                });
                const programsProcessed = processProgramsData(data, date);
                let statePrograms = [...state.allProgramList];
                const indexOfDateExits = statePrograms.findIndex(programsByDate => compareTwoDates(programsByDate.date, date) === true);
                if (indexOfDateExits === -1) {
                    statePrograms.push({
                        date: date,
                        data: programsProcessed,
                    });
                } else {
                    statePrograms[indexOfDateExits] = {
                        date: date,
                        data: [...statePrograms[indexOfDateExits].data, ...programsProcessed],
                    };
                }
                return {
                    ...state,
                    allProgramList: statePrograms,
                    isFetchingChannelPrograms: false
                };
            } catch (e) {
                console.log('FETCH_PROGRAMS_SUCCESS: error ', e)
            }

        }    
```

1. ChannelModel:
```js
export class Channel {
  constructor(
    imageSrc,
    id,
    externalChannelId,
    name,
    url,
    description,
    category,
    extrafields,
    number,
    isNpvrActivated,
    isCatchupActivated,
    isFavouriteActivated,
    isPurchaseActivated
  ) {
    this.imageSrc = imageSrc || '';
    this.id = id || -1;
    this.externalChannelId = externalChannelId || '';
    this.name = name || '';
    this.url = url || '';
    this.name = name || '';
    this.description = description || '';
    this.category = category || '';
    this.extrafields = extrafields || [];
    this.number = number || -1;
    this.isNpvrActivated = isNpvrActivated || false;
    this.isCatchupActivated = isCatchupActivated || false;
    this.isFavouriteActivated = isFavouriteActivated || false;
    this.isPurchaseActivated = isPurchaseActivated || false;
  }

  unSerialize(obj) {
    this.imageSrc = obj.imageSrc || '';
    this.id = obj.id || -1;
    this.externalChannelId = obj.externalChannelId || '';
    this.name = obj.name || '';
    this.url = obj.url || '';
    this.name = obj.name || '';
    this.description = obj.description || '';
    this.category = obj.category || '';
    this.extrafields = obj.extrafields || [];
    this.number = obj.number || -1;
    this.isNpvrActivated = obj.isNpvrActivated || false;
    this.isCatchupActivated = obj.isCatchupActivated || false;
    this.isFavouriteActivated = obj.isFavouriteActivated || false;
    this.isPurchaseActivated = obj.isPurchaseActivated || true;
  }
}
```

2. ProgramModel, ProgramItemModel: 
```js
export class ProgramItemModel {
  constructor(
    id,
    name,
    shortName,
    seriesName,
    description,
    prName,
    startDate,
    endDate,
    startDateAdjusted,
    endDateAdjusted,
    referenceProgramId,
    flags,
    responseElementType,
    price,
    imageSrc,
    recordingStatus,
    genres,
    prLevel
  ) {
    this.id = id || -1;
    this.name = name || '';
    this.shortName = shortName || '';
    this.seriesName = seriesName || '';
    this.description = description || '';
    this.prName = prName || '';
    this.startDate = startDate || 0;
    this.endDate = endDate || 0;
    this.startDateAdjusted = startDateAdjusted || 0;
    this.endDateAdjusted = endDateAdjusted || 0;
    this.referenceProgramId = referenceProgramId || '';
    this.flags = flags || -1;
    this.responseElementType = responseElementType || '';
    this.price = price || 0;
    this.imageSrc = imageSrc || '';
    this.recordingStatus = recordingStatus || -1;
    this.genres = genres || [];
    this.prLevel = prLevel || -1;
  }

  unSerialize(obj) {
    this.id = obj.id || -1;
    this.name = obj.name || '';
    this.shortName = obj.shortName || '';
    this.seriesName = obj.seriesName || '';
    this.description = obj.description || '';
    this.prName = obj.prName || '';
    this.startDate = obj.startDate || 0;
    this.endDate = obj.endDate || 0;
    this.startDateAdjusted = obj.startDateAdjusted || 0;
    this.endDateAdjusted = obj.endDateAdjusted || 0;
    this.referenceProgramId = obj.referenceProgramId || '';
    this.flags = obj.flags || -1;
    this.responseElementType = obj.responseElementType || '';
    this.price = obj.price || 0;
    this.imageSrc = obj.imageSrc || '';
    this.recordingStatus = obj.recordingStatus || -1;
    this.genres = obj.genres || [];
    this.prLevel = obj.prLevel || -1;
  }
}

export class ProgramModel {
  constructor(channelExternalId, programs) {
    this.channelExternalId = channelExternalId || '';
    this.programs = programs || [];
  }

  unSerialize(obj) {
    this.channelExternalId = obj.channelExternalId || '';
    if (obj.programs) {
      if (obj.programs.map) {
        this.programs =
          obj.programs.map((item) => {
            const programItemModel = new ProgramItem();
            programItemModel.unSerialize(item);
            return programItemModel;
          }) || [];
      } else {
        this.programs = [];
      }
    } else {
      this.programs = [];
    }
  }
}
```
#### After you have data example: 
```js
    channel = {
        imageSrc: string,
        id: number,
        externalChannelId: string,
        name: string,
        url: string,
        description: string,
        category: string,
        extrafields: array,
        number: number,
        npvrEnabled: bool,
        isNpvrActivated: bool,
        isCatchupActivated: bool,
        catchupEnabled: bool,
        favouriteEnabled: bool,
        isFavouriteActivated: bool,
        purchaseEnabled: bool,
        isPurchaseActivated: bool,
    };
//default value
    channel =  {
        imageSrc: null,
        id: -1,
        externalChannelId: '',
        name: '',
        url: '',
        description: '',
        category: '',
        extrafields: [],
        number: -1,
        npvrEnabled: false,
        isNpvrActivated: false,
        isCatchupActivated: false,
        catchupEnabled: false,
        favouriteEnabled: false,
        isFavouriteActivated: false,
        purchaseEnabled: false,
        isPurchaseActivated: false,
    }
};
//example value
    channel =  {
        imageSrc: 'https://votvapps-ng-test.tvaas.com/RTEFacade/images/attachments/TV2.png',
        id: 1895201,
        externalChannelId: 'LuxeTV',
        name: 'Luxe TV',
        url: '',
        description: '',
        category: '',
        extrafields: [
            {
                responseElementType: "Extrafield",
                name: "static-playback",
                value: "false"
            }
        ],
        number: 12,
        npvrEnabled: false,
        isNpvrActivated: false,
        isCatchupActivated: false,
        catchupEnabled: false,
        favouriteEnabled: false,
        isFavouriteActivated: false,
        purchaseEnabled: false,
        isPurchaseActivated: false,
    }
};
const channeList =  [
    {
        ...channel
    },
    {
        ...channel   
    },
    ...
];


//PROGRAM DATA FORMART
    program = {
        id:  number,
        name:  string,
        shortName:  string,
        serisName:  string,
        description:  string,
        prName:  string,
        startDate:  number,//(timestamp)
        endDate:  number,//(timestamp)
        startDateAdjusted:  number,// default equal to startDate (timestamp), adjusted to fix start of day (00:00:00)
        endDateAdjusted:  number,// default equal to endDate (timestamp), adjusted to fix end of day (23:59:59)
        referanceProgramId:  string,
        flags:  number,
        seriesSeasion:  string,
        responseElementType:  string,
        price:  number,
        imageSrc: string,
        genres:  array,
        prLevel:  number,
    } 
// default value 
    program = {
        id:  -1,
        name:  '',
        shortName:  '',
        serisName:  '',
        description:  '',
        prName:  '',
        startDate:  0,//(timestamp)
        endDate:  0,//(timestamp)
        startDateAdjusted:  0,// default equal to startDate (timestamp), adjusted to fix start of day (00:00:00)
        endDateAdjusted:  0,// default equal to endDate (timestamp), adjusted to fix end of day (23:59:59)
        referanceProgramId:  '',
        flags:  0,
        seriesSeasion:  '',
        responseElementType:  '',
        price:  0,
        imageSrc: '',
        genres:  [],
        prLevel:  0,
    }  
//example data
 program = {
        id:  12966715,
        name:  'Los milagros de la rosa',
        shortName:  '',
        serisName:  '',
        description:  '',
        imageSrc: 'https://votvapps-ng-test.tvaas.com/RTEFacade/images/12055411.jpg',
        prName:  'APT',
        startDate:  1641769200000,//(timestamp)
        endDate:  1641776400000,//(timestamp)
        startDateAdjusted:  1641769200000,// default equal to startDate (timestamp), adjusted to fix start of day (00:00:00)
        endDateAdjusted:  1641776400000,// default equal to endDate (timestamp), adjusted to fix end of day (23:59:59)
        referanceProgramId:  '2466657917202201091800120',
        flags:  0,
        seriesSeasion:  '',
        responseElementType:  'Program',
        price:  0.0,
        genres:  [],
        prLevel:  0,
    }



const programList  = [ 
    {
        channelExternalId:'France24Fr2',
        programs: [program,...]
    },
    {
        channelExternalId:'ArteLoop',
        programs: [program,...]
    },
    {
        channelExternalId:'Arte',
        programs: [program,...]
    },
    ....
];
```
[Data example ](https://forge-git-external.viaccess.fr/APPS/TVaaS/tvapps-epg-androidtv/-/tree/tvapps-epg-mobile/src/data)


### Usage :
---

#### Import TV Guide Mobile component with default properties below:

#### NOTE: 
###### - [x] Pass props to TVGuideMobile components : channelList & programList have to length and synchronized.

 ###### - [x] ProgramModel, ChannelModel have to imageSrc property with url image is low resolution photo (200x200) recommended that good for performancer render app.


##### Custom Configs layout component for mobile:

You can change layout:

 - [x] timeLineHeaderHeight: Height time line header default
 - [x] programLineHeight: height of program, channel, default
 - [x] numberOfTimelineCellDisplayed: Number Time cell in time line header default 4;// equal 2 hours: 30 minutes per cell
 - [x] channelListWidth: Width list channels left of TV Guide component 
 - [x] numberOfFutureDays: Number Dates Can show in the future 
 - [x] numberOfPastDays: Number Dates Can show in the past 


You can specify config defaults that will be applied to every request.
##### Config Defaults
---

Important pass to component properties required:  .


| Prop types                 | meaning,                                            | default or output                                        |
|:---------------------------|:--------------------------------------------------|:----------------------------------------------------------|
 | channeList             |Channel list data with channel model item          | [channel, channel,...] (array)|
 | programList             | Program list data with program model)           |[program,program ,...] (array) |
 | currentDate             |Current date display data epg         |today = new Date() (Date)|
 | numberOfFutureDays             |the days next from to day           |3 days (number)|
 | numberOfPastDays             | the past day fro today           | 3 days (number) |
 | sizePerPage             |size data pagination fetch more data once call API            |20  (number) |
 | isLastPageOffset             |is lastest page fetch more data from API           | false or true (bool) |
 | onDateChange             | Call back function when press another date header filter           | (date) => {} (cb func) |
 | onProgramSelectedChange    |Call back func when program seleted changed        | ({program})=>{} (cb func) |
 | tvGuideWidth             | EPG component width            | 30 (px) |
 | tvGuideHeight             | EPG component height           | Device Screen height (px) |
 | timeLineHeaderHeight             |time line list height (00:00-> 24:00)           | Device Screen width (px) |
 | numberOfTimelineCellDisplayed    | number time ranger show (30 min per unit)           |2 (number) |
 | onReachingEndChannel             |Callback func when fetch more data channel fired)           |()=>{}(cb fn) |
 | programLineHeight             | height of program line height          | 60 (px) |
 | channelListWidth             |channel list container witdth          | 72(px) |
 

```js
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, PixelRatio, Image } from 'react-native';
import {
    fetchChannelsAction,
    getProgramsByChannelsAction
} from '../redux/actions';

import { TVGuideMobile, MOBILE_GUIDE_CONSTANTS, getStartDayTimestamp } from 'tvapps-epg-mobile';

import { useSelector, useDispatch } from 'react-redux';


const NUMBER_CHANNEL_DISPLAY = 10;
const SIZE_PER_PAGE = 2 * NUMBER_CHANNEL_DISPLAY;

var allProgramListSafe = [];
var today = new Date();
var channelExternalIDList = [];
var dateFilter = new Date();
var pageOffset = 1;



function HomeScreen(props) {
    const dispatch = useDispatch();
    const state = useSelector(state => state.tvGuideState);
    const {
        channelList,
        allProgramList,
        isFetchingChannelPrograms
    } = state || {};


    const [channelListState, setChannelListState] = useState([]);
    const [programListState, setProgramListState] = useState([]);
    const [currentDateDisplay, setCurrentDateDisplay] = useState(new Date());
    const [isLastPageOffset, setIsLastPageOffset] = useState(false);

    const onDateChange = useCallback(async dateValue => {
        await dispatch(getProgramsByChannelsAction([...channelExternalIDList.slice(0, SIZE_PER_PAGE)], dateValue));
        dateFilter = dateValue;
        setCurrentDateDisplay(dateValue);
        setIsLastPageOffset(false);
    }, []);

    const onReadEndChannelsPrograms = () => {
        const channelListExternalChannelId = [...channelExternalIDList.slice(pageOffset * SIZE_PER_PAGE, (pageOffset + 1) * SIZE_PER_PAGE)];
        if (channelListExternalChannelId.length > 0) {
            dispatch(getProgramsByChannelsAction(channelListExternalChannelId, currentDateDisplay));
            pageOffset++;
        }
    };

    const onProgramSelectedChange = useCallback(({ program }) => {
        console.log('onProgramSelectedChange: ', program)
    }, []);

    useEffect(() => {
        if (channelList && channelList.length > 0) {
            channelExternalIDList = channelList.map(channel => channel.externalChannelId);
            dispatch(getProgramsByChannelsAction([...channelExternalIDList.slice(0, SIZE_PER_PAGE)], today));
        }
    }, [channelList]);

    useEffect(() => {
        if (allProgramList && allProgramList.length > 0) {
            allProgramListSafe = [...allProgramList];
            const programData = allProgramListSafe.find(channelProgramList => getStartDayTimestamp(channelProgramList.date) === getStartDayTimestamp(dateFilter));
            if (programData && programData.data) {
                setProgramListState(programData.data);
                const listChannelComponent = [...channelList.slice(0, programData.data.length)];
                setChannelListState(listChannelComponent);
                if (listChannelComponent.length === channelList.length) {
                    setIsLastPageOffset(true);
                }
            }
        }
    }, [allProgramList]);

    useEffect(() => {
        dispatch(fetchChannelsAction());
    }, []);

    return (
        <View style={styles.container}>

            <TVGuideMobile
                tvGuideWidth={MOBILE_GUIDE_CONSTANTS.DEVICE_WIDTH}
                tvGuideHeight={MOBILE_GUIDE_CONSTANTS.DEVICE_HEIGHT}
                timeLineHeaderHeight={30}
                numberOfChannelsDisplayed={NUMBER_CHANNEL_DISPLAY}
                numberOfTimelineCellDisplayed={2}
                channeList={channelListState}
                programList={programListState}
                numberOfFutureDays={3}
                numberOfPastDays={2}
                currentDate={currentDateDisplay}
                onReachingEndChannel={onReadEndChannelsPrograms}
                programStylesColors={{
                    activeProgramBackgroundColor: '#463cb4',
                    currentProgramBacgroundColor: '#FFFFFF',
                    pastProgramBackgroundColor: '#463db4',
                    futureProgramBackgroundColor: '#463cb4',
                    activeProgramTextColor: '#FFFFFF',
                    currrentProgramTextColor: '#000000',
                    pastProgramTextColor: '#ffffff',
                    futureProgramTextColor: '#FFFFFF',
                    startDateProgramBackgroundColor: '#c34164',
                    startDateProgramTextColor: '#FFFFFF',
                    startDateProgramTextFontSize: 15,
                    programNameFontSize: 16
                }}
                timeLineHeaderTextFontSize={18}
                timeIndicatorStyles={{ backgroundColor: MOBILE_GUIDE_CONSTANTS.THEME_STYLES.LOADING_INDICATOR_COLOR, width: 6, borderRadius: 3 }}
                containerBackroundColor={'#0b004c'}
                programLineHeight={60}
                channelListWidth={70}
                onDateChange={onDateChange}
                onProgramSelectedChange={onProgramSelectedChange}
                sizePerPage={SIZE_PER_PAGE}
                isLastPageOffset={isLastPageOffset}
            />
        </View>

    );
}

export default React.memo(HomeScreen);

const styles = StyleSheet.create({...});
```



##### Custom Styles background color, text color...
---
```js
 programStylesColors={{
                    activeProgramBackgroundColor: '#463cb4',
                    currentProgramBacgroundColor: '#FFFFFF',
                    pastProgramBackgroundColor: '#463db4',
                    futureProgramBackgroundColor: '#463cb4',
                    activeProgramTextColor: '#FFFFFF',
                    currrentProgramTextColor: '#000000',
                    pastProgramTextColor: '#ffffff',
                    futureProgramTextColor: '#FFFFFF',
                    startDateProgramBackgroundColor: '#c34164',
                    startDateProgramTextColor: '#FFFFFF',
                    startDateProgramTextFontSize: 15,
                    programNameFontSize: 16
                }}
                timeLineHeaderTextFontSize={18}
                timeIndicatorStyles={{ backgroundColor: MOBILE_GUIDE_CONSTANTS.THEME_STYLES.LOADING_INDICATOR_COLOR, width: 6, borderRadius: 3 }}
                containerBackroundColor={'#0b004c'}
 ```

![Custom UI screenshoot](https://user-images.githubusercontent.com/90168097/149857828-c2ee0401-5fc0-450b-9b20-6c0eb08c569e.jpg)

 


#### Project Demo import component here:

[React native tvapps-epg-mobile ](https://forge-git-external.viaccess.fr/APPS/TVaaS/tvapps-epg-demo/-/blob/tvapps-epg-mobile/tvApps/src/)