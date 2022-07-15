import { TV_GUIDE_CONSTANTS } from "../mobileEPG/constants";
import uuid from "react-native-uuid";
import { ProgramModel, ProgramItemModel, ChannelModel } from "./models";

const DUARTION_TIME_DAY = 24 * 60 * 60 * 1000;

export function formatDay(time) {
  return new Date(time).toString().substring(0, 10);
}
export function formatTime(time) {
  return time.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}
export function formatShortDate(time) {
  const day = new Date(time);
  const dayString = day.getDate() < 10 ? `0${day.getDate()}` : day.getDate();
  const monthString =
    day.getMonth() + 1 < 10 ? `0${day.getMonth() + 1}` : day.getMonth() + 1;
  return `${dayString}/${monthString}/${day.getUTCFullYear()}`;
}

export function formatHourMin(timestamp) {
  const day = new Date(timestamp);
  let minutes = day.getMinutes();
  if (isTimestampEqualEndOfDay(timestamp)) {
    minutes = 0;
    const minutesText = minutes < 10 ? `0${minutes}` : minutes;
    return `0:${minutesText}`;
  } else {
    const minutesText = minutes < 10 ? `0${minutes}` : minutes;
    return `${day.getHours()}:${minutesText}`;
  }
}

const userTimezoneDate = (date) => {
  const _date = new Date(date.getTime());
  const userTimeZoneOffset = _date.getTimezoneOffset() * 60000;
  return new Date(_date.getTime() + userTimeZoneOffset);
};

export const generateTimelineData = (day) => {
  let date = userTimezoneDate(new Date());
  let dateEnd = userTimezoneDate(new Date());
  date.setHours(0, 0, 0, 1);
  let timeStpCount = date.getTime();
  dateEnd.setHours(23, 59, 59, 999);
  const endOfDate = dateEnd.getTime();
  let listTime = [];

  while (timeStpCount < endOfDate) {
    const h = date.getHours();
    const m = date.getMinutes();
    listTime.push({
      start: date.getTime(),
      text: `${h < 10 ? "0" : ""}${h}:${m === 0 ? "00" : m}`,
    });
    date.setMinutes(date.getMinutes() + 30);
    timeStpCount = date.getTime();
  }
  return listTime;
};

export const getStartDayTimestamp = (day) => {
  let date = new Date(day);
  date.setHours(0, 0, 0, 1);
  return date.getTime();
};

export const getEndDayTimestamp = (day) => {
  let date = new Date(day);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

export const devideNoProgramByHalfHour = (noProgram) => {
  let noProgramList = [];
  const deltalTime = noProgram.endDateAdjusted - noProgram.startDateAdjusted;
  if (deltalTime > TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION) {
    const loop = Math.floor(
      (deltalTime - (deltalTime % TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION)) /
        TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION
    );
    for (let j = 0; j < loop; j++) {
      const startDateEdited =
        noProgram.startDateAdjusted + j * TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION;
      noProgramList.push({
        ...noProgram,
        startDate: startDateEdited,
        startDateAdjusted: startDateEdited,
        endDate: startDateEdited + TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION,
        endDateAdjusted:
          startDateEdited + TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION,
      });
    }
    if (deltalTime % TV_GUIDE_CONSTANTS.HALF_HOUR_DURATION !== 0) {
      noProgramList.push({
        ...noProgram,
        startDate: noProgramList[noProgramList.length - 1].endDate,
        startDateAdjusted:
          noProgramList[noProgramList.length - 1].endDateAdjusted,
        endDate: noProgram.endDateAdjusted,
        endDateAdjusted: noProgram.endDateAdjusted,
      });
    }
  } else {
    noProgramList.push({ ...noProgram });
  }
  return noProgramList;
};

export const processProgramsData = (programListData, day) => {
  try {
    const startOfDayTimestamp = getStartDayTimestamp(day);
    const endOfDayTimestamp = getEndDayTimestamp(day);
    return programListData.map((channel, indexChannel) => {
      const { programs } = channel;
      programs.sort(
        (program1, program2) => program1?.startDate - program2?.startDate
      );
      if (Array.isArray(programs) && programs.length === 0) {
        let programsFilledOfDay = fillNoProgramsOfDay(day);
        return {
          ...channel,
          programs: programsFilledOfDay,
        };
      }
      let newNoProgramList = [];
      programs.map((programItem, indexProgram) => {
        if (programItem.startDate < startOfDayTimestamp) {
          programItem.startDateAdjusted = startOfDayTimestamp;
        } else {
          programItem.startDateAdjusted = programItem.startDate;
        }
        if (programItem.endDate > endOfDayTimestamp) {
          programItem.endDateAdjusted = endOfDayTimestamp;
        } else {
          programItem.endDateAdjusted = programItem.endDate;
        }

        if (programItem && programItem.id === -1) {
          programItem.name = "No Program Info";
          const newNoProgramItemProcessed =
            devideNoProgramByHalfHour(programItem);
          newNoProgramList = [
            ...newNoProgramList,
            ...newNoProgramItemProcessed,
          ];
        }
        if (
          indexProgram !== programs.length - 1 &&
          programItem.endDateAdjusted <
            programs[indexProgram + 1].startDateAdjusted
        ) {
          const newNoProgramItemProcessed = devideNoProgramByHalfHour({
            id: -1,
            name: "No Program Info",
            startDate: programItem.endDateAdjusted,
            startDateAdjusted: programItem.endDateAdjusted,
            endDate: programs[indexProgram + 1].startDate,
            endDateAdjusted: programs[indexProgram + 1].startDate,
          });
          newNoProgramList = [
            ...newNoProgramList,
            ...newNoProgramItemProcessed,
          ];
        }
        return programItem;
      });

      const programHasInfo = programs.filter((program) => program.id !== -1);
      const dataPrograms = [...programHasInfo, ...newNoProgramList];
      dataPrograms.sort(
        (program1, program2) =>
          program1.startDateAdjusted - program2.startDateAdjusted
      );

      return {
        ...channel,
        programs: dataPrograms,
      };
    });
  } catch (error) {
    return error;
  }
};

export const getDefaultActiveProgramIndex = (programsList) => {
  if (
    typeof programsList !== "object" ||
    !programsList ||
    programsList.length === 0
  )
    return 0;
  const today = new Date();
  const todayTimestamp = today.getTime();
  const indexProgramInitialFocus = programsList.findIndex(
    (program) =>
      program.startDate <= todayTimestamp && program.endDate >= todayTimestamp
  );
  if (indexProgramInitialFocus !== -1) return indexProgramInitialFocus;
  return 0;
};

export const fillNoProgramsOfDay = (day) => {
  let programList = [];
  const timestampEndOfDay = getEndDayTimestamp(day);
  const timesGenarator = generateTimelineData(day);
  timesGenarator.map((timePart, index) => {
    if (index !== timesGenarator.length - 1) {
      programList.push({
        id: -1,
        startDate: timePart.start,
        startDateAdjusted: timePart.start,
        endDate: timesGenarator[index + 1].start,
        endDateAdjusted: timesGenarator[index + 1].start,
        name: "No program info",
      });
    } else {
      programList.push({
        id: -1,
        startDate: timePart.start,
        startDateAdjusted: timePart.start,
        endDateAdjusted: timestampEndOfDay,
        endDate: timestampEndOfDay,
        name: "No program info",
      });
    }
  });
  return programList;
};

export const getDurationFromDateStart = (day, time) => {
  return Number(time - getStartDayTimestamp(day));
};

export const getDurationToDateEnd = (day, time) => {
  return Number(getEndDayTimestamp(day) - time);
};

export const compareTwoDates = (date1, date2) => {
  let day1 = new Date(date1);
  day1.setHours(0, 0, 0, 1);
  let day2 = new Date(date2);
  day2.setHours(0, 0, 0, 1);
  return day1.getTime() === day2.getTime();
};

export const isPreviousDate = (date1, date2) => {
  let day1 = new Date(date1);
  day1.setHours(0, 0, 0, 1);
  let day2 = new Date(date2);
  day2.setHours(0, 0, 0, 1);
  if (day1.getTime() - day2.getTime() >= 0) {
    return false;
  }
  return true;
};

export const isTimestampEqualEndOfDay = (timestamp) => {
  let date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return timestamp === date.getTime();
};

export const getSuffixHour = (time) => {
  const hour = new Date(time).getHours();
  if (hour >= 12) {
    return "PM";
  }
  return "AM";
};

export const checkIsValidDurationDate = (duration, day) => {
  let date = new Date(day);
  date.setHours(0, 0, 0, 0);
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let isValid = false;
  if (today.getTime() > date.getTime()) {
    const deltaTime = today.getTime() - date.getTime();
    if (deltaTime <= duration * DUARTION_TIME_DAY) {
      isValid = true;
    }
  } else {
    const deltaTime = date.getTime() - today.getTime();
    if (deltaTime <= duration * DUARTION_TIME_DAY) {
      isValid = true;
    }
  }
  return isValid;
};

export const getIndexProgramNextFocus = ({ programs, timeLineShow }) => {
  let data = [...programs];
  const timeAVG =
    (timeLineShow[0].start + timeLineShow[timeLineShow.length - 1].start) / 2;
  data.sort((program1, program2) => {
    return (
      program1.startDateAdjusted -
      timeAVG -
      (program2.startDateAdjusted - timeAVG)
    );
  });
  const minStartDateAdjustedProgram = data[0];
  return programs.findIndex(
    (program) => program.startDateAdjusted === minStartDateAdjustedProgram
  );
};

export const getIndexOfProgramNextFocus = ({
  programs,
  programActive,
  lineIndex,
}) => {
  try {
    let indexNextActive = 0;
    const programList = programs[lineIndex].programs;
    const programListClone = [...programList];
    programListClone.map((program, index) => {
      const { startDateAdjusted, endDateAdjusted } = program;
      if (
        startDateAdjusted <= programActive.startDateAdjusted &&
        endDateAdjusted >= programActive.endDateAdjusted
      ) {
        indexNextActive = index;
      }
    });
    if (indexNextActive === 0) {
      const nextProgramClosestStartDateAdjusted = programListClone.reduce(
        (program1, program2) => {
          return Math.abs(
            program2.startDateAdjusted - programActive.startDateAdjusted
          ) <
            Math.abs(
              program1.startDateAdjusted - programActive.startDateAdjusted
            )
            ? program2
            : program1;
        }
      );
      indexNextActive = programListClone.findIndex(
        (program) =>
          program.startDateAdjusted ===
          nextProgramClosestStartDateAdjusted.startDateAdjusted
      );
    }
    return indexNextActive;
  } catch (error) {
    return 0;
  }
};

export const caculateDurationProgram = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  return `${Math.round(Math.abs(endDate - startDate) / (1000 * 60))} min`;
};

export const getDataListFilter = (numberOfPastDays, numberOfFutureDays) => {
  const today = new Date();
  let dataList = [];
  let startDate = new Date();
  startDate.setDate(today.getDate() - numberOfPastDays);
  let endDate = new Date();
  endDate.setDate(today.getDate() + numberOfFutureDays);
  while (getStartDayTimestamp(startDate) <= getStartDayTimestamp(endDate)) {
    dataList.push({
      date: new Date(startDate),
      key: new Date(startDate).getTime(),
    });
    startDate.setDate(startDate.getDate() + 1);
  }
  return dataList;
};

export const exportSkeletonProgramData = (number, day) => {
  const startTimestamp = getStartDayTimestamp(day);
  const endTimestamp = getEndDayTimestamp(day);
  let data = [];
  for (let i = 0; i < number; i++) {
    const programItem = {
      id: 0,
      name: "",
      startDate: startTimestamp,
      endDate: endTimestamp,
      startDateAdjusted: startTimestamp,
      endDateAdjusted: endTimestamp,
    };
    const programItemModal = new ProgramItemModel();
    programItemModal.unSerialize(programItem);
    const programModel = new ProgramModel(uuid.v4(), [programItemModal]);
    data.push(programModel);
  }
  return data;
};

export const exportSkeletonChannelData = (number) => {
  let data = [];
  for (let i = 0; i < number; i++) {
    const channel = {
      id: 0,
      number: 0,
      name: "",
      externalChannelId: uuid.v4(),
    };
    const channelModal = new ChannelModel();
    channelModal.unSerialize(channel);
    data.push(channelModal);
  }
  return data;
};
