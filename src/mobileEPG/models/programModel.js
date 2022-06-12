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