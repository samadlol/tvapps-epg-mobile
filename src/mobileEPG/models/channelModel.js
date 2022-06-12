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