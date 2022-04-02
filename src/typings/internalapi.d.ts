type GdprDataOptions = {
  expires?: Date;
  initiatedBy?: string | number;
};

type GdprStoreItem = {
  /**
   * A buffer containing a zip file with the GDPR data
   */
  data: Buffer;
  expires: Date;
  initiatedAt: Date;
  initiatedBy?: string | number;
};

type GdprStore = {
  [key: string]: GdprStoreItem;
};

type GdprData = {
  [key: string]: any;
};

type generateGdprDataResponse = {
  expires: Date;
  id: string;
  url: string;
  deletion_url: string;
};
