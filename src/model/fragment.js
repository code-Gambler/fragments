// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const logger = require('../logger');
const md = require('markdown-it')({
  html: true,
});
const sharp = require('sharp');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created = new Date().toISOString(), updated = new Date(), type, size = 0 }) {
    if (ownerId == undefined) {
      throw new Error('Please provide the OwnerId');
    }

    if (type == undefined) {
      throw new Error('Please provide Type');
    }

    if (typeof size !== 'number') {
      throw new Error('size must be a number');
    }
    if (size < 0) {
      throw new Error('Size must not be Negative');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error('invalid type');
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || created.toISOString();
    this.updated = updated || updated.toISOString();
    this.type = type;
    this.size = size || 0;

    logger.info(`Created new fragment`);
    logger.debug(`Fragment details: ${JSON.stringify(this)}`);
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    logger.debug(`Pulling list of fragments for User: ${ownerId}`);
    return listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    logger.debug(`Pulling MetaData for the fragment with id: ${id}`);
    return new Fragment(await readFragment(ownerId, id));
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    logger.info(`Deleting Fragment`);
    logger.debug(`Deleting Fragment of id:${id}, for Owner with: ${ownerId}`);
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    logger.info(`Saving MetaData for the fragment`);
    logger.debug(`Saving MetaData for the fragment with id: ${this.id}`);
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    logger.info(`Pulling Data for the fragment`);
    logger.debug(`Pulling Data for the fragment with id: ${this.id}`);
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (Buffer.isBuffer(data)) {
      this.size = data.length;
      await this.save();
      logger.info(`Setting Data for fragment`);
      logger.debug(`Setting Data for fragment with id: ${this.id}`);
      return await writeFragmentData(this.ownerId, this.id, data);
    }
    else {
      throw new Error('Please provide a Buffer!')
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    if (this.type.indexOf('text') !== -1) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.mimeType == "text/plain") {
      return ["text/plain"];
    }
    else if (this.mimeType == "text/markdown") {
      return ["text/html"];
    }
    else {
      return []
    }
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    logger.debug(`Checking Data Type`);
    let type = value;
    logger.debug(`Data Type: ${value}`);
    if (value.indexOf(';') != -1) {
      type = value.slice(0, value.indexOf(';'));
      logger.debug(`Data Type after triming: ${type}`);
    }
    if (type == 'text/plain') {
      logger.debug(`Supported type of ${value}`);
      return true;
    }
    else if (type == 'text/markdown') {
      logger.debug(`Supported type of ${value}`);
      return true;
    }
    else if (type == 'text/html') {
      logger.debug(`Supported type of ${value}`);
      return true;
    }
    else if (type == 'application/json') {
      logger.debug(`Supported type of ${value}`);
      return true;
    }
    else if (type == 'image/png') {
      logger.debug(`Supported type of ${value}`);
      return true;
    }
    else if (type == 'image/jpeg') {
      logger.debug(`Supported type of ${value}`);
      return true;
    }
    else if (type == 'image/webp') {
      logger.debug(`Supported type of ${value}`);
      return true;
    }
    else {
      logger.debug(`Unsupported type of ${value}`);
      return false;
    }
  }

  static extConvert(extension) {
    var type = '';
    if (extension == '.md') {
      type = 'markdown';
    } else if (extension == '.txt') {
      type = 'plain';
    } else if (extension == '.jpg') {
      type = 'jpeg';
    } else {
      type = extension;
    }
    return type;
  }

  async textConvert(data, value) {
    var result;
    if (value == 'plain') {
      if (this.type == 'application/json') {
        result = JSON.parse(data);
      } else {
        result = data;
      }
    } else if (value == 'html') {
      if (this.type.endsWith('markdown')) {
        result = md.render(data.toString());
      }
    }
    return result;
  }

  async imageConvert(value) {
    var result, fragmentData;
    fragmentData = await this.getData();

    if (this.type.startsWith('image')) {
      if (value == 'gif') {
        result = sharp(fragmentData).gif();
      } else if (value == 'jpg' || value == 'jpeg') {
        result = sharp(fragmentData).jpeg();
      } else if (value == 'webp') {
        result = sharp(fragmentData).webp();
      } else if (value == 'png') {
        result = sharp(fragmentData).png();
      }
    }
    return result.toBuffer();
  }

  static validateConversion(type) {
    switch (type) {
      case 'text/plain':
        return '.txt';
      case 'text/markdown':
        return ['.md', '.html', '.txt'];
      case 'text/html':
        return ['.html', '.txt'];
      case 'application/json':
        return ['.json', '.txt'];
      case 'image/png':
        return ['.png', '.jpg', '.webp', '.gif'];
      case 'image/jpeg':
        return ['.png', '.jpg', '.webp', '.gif'];
      case 'image/webp':
        return ['.png', '.jpg', '.webp', '.gif'];
      case 'image/gif':
        return ['.png', '.jpg', '.webp', '.gif'];
    }
  }
}

module.exports.Fragment = Fragment;
