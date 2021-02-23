/**
 * DatabaseError is thrown when the database could not be accessed.
 *
 * @category Errors
 */
export class DatabaseError extends Error {

  /**
   * DatabaseError constructor.
   *
   * @param {Object} options
   */
  constructor(options = {}) {
    options.message = "There was an error accessing the database."
    options.code = 500
    super(options)
  }
}

export default {
  DatabaseError,
}
