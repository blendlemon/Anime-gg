import pool from '../config/database.js'

export class Tournament {
  static async create(name, description, createdBy) {
    const connection = await pool.getConnection()
    try {
      const [result] = await connection.execute(
        'INSERT INTO tournaments (name, description, created_by) VALUES (?, ?, ?)',
        [name, description, createdBy]
      )
      return result.insertId
    } finally {
      connection.release()
    }
  }

  static async getById(id) {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM tournaments WHERE id = ?',
        [id]
      )
      return rows[0]
    } finally {
      connection.release()
    }
  }

  static async getAll() {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.execute('SELECT * FROM tournaments')
      return rows
    } finally {
      connection.release()
    }
  }
}
