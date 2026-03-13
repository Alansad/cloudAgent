import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { app } from 'electron'

export interface LogEntry {
  id?: number
  type: 'chat' | 'api_call' | 'web_automation' | 'mcp_call' | 'error' | 'system'
  level: 'info' | 'warn' | 'error' | 'debug'
  content: string
  data?: any
  timestamp: number
}

class Logger {
  private db: any = null
  private dbPath: string = ''

  async init() {
    if (this.db) return

    try {
      const userDataPath = app?.getPath('userData') || './'
      this.dbPath = path.join(userDataPath, 'agent-logs.db')

      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      })

      // 创建日志表
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          level TEXT NOT NULL,
          content TEXT NOT NULL,
          data TEXT,
          timestamp INTEGER NOT NULL
        )
      `)

      // 创建索引
      await this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);
        CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
      `)
    } catch (error) {
      console.error('日志数据库初始化失败:', error)
      // 降级使用内存存储
      this.db = null
    }
  }

  async log(entry: Omit<LogEntry, 'timestamp'>): Promise<void> {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: Date.now()
    }

    // 控制台输出
    const logMethod = entry.level === 'error' ? console.error : 
                    entry.level === 'warn' ? console.warn : 
                    entry.level === 'debug' ? console.debug : console.log
    
    logMethod(`[${new Date(logEntry.timestamp).toISOString()}] [${entry.type}] [${entry.level}] ${entry.content}`, entry.data || '')

    // 写入数据库
    if (this.db) {
      try {
        await this.db.run(
          `INSERT INTO logs (type, level, content, data, timestamp)
           VALUES (?, ?, ?, ?, ?)`,
          [
            entry.type,
            entry.level,
            entry.content,
            entry.data ? JSON.stringify(entry.data) : null,
            logEntry.timestamp
          ]
        )
      } catch (error) {
        console.error('写入日志失败:', error)
      }
    }
  }

  async queryLogs(
    options: {
      type?: string
      level?: string
      startTime?: number
      endTime?: number
      limit?: number
      offset?: number
    } = {}
  ): Promise<LogEntry[]> {
    if (!this.db) return []

    try {
      const { type, level, startTime, endTime, limit = 100, offset = 0 } = options
      
      let sql = 'SELECT * FROM logs WHERE 1=1'
      const params: any[] = []

      if (type) {
        sql += ' AND type = ?'
        params.push(type)
      }

      if (level) {
        sql += ' AND level = ?'
        params.push(level)
      }

      if (startTime) {
        sql += ' AND timestamp >= ?'
        params.push(startTime)
      }

      if (endTime) {
        sql += ' AND timestamp <= ?'
        params.push(endTime)
      }

      sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?'
      params.push(limit, offset)

      const rows = await this.db.all(sql, params)
      
      return rows.map((row: any) => ({
        ...row,
        data: row.data ? JSON.parse(row.data) : undefined
      }))
    } catch (error) {
      console.error('查询日志失败:', error)
      return []
    }
  }

  async clearLogs(olderThan?: number): Promise<boolean> {
    if (!this.db) return false

    try {
      let sql = 'DELETE FROM logs'
      const params: any[] = []

      if (olderThan) {
        sql += ' WHERE timestamp < ?'
        params.push(olderThan)
      }

      await this.db.run(sql, params)
      return true
    } catch (error) {
      console.error('清空日志失败:', error)
      return false
    }
  }

  // 快捷方法
  info(type: LogEntry['type'], content: string, data?: any) {
    return this.log({ type, level: 'info', content, data })
  }

  warn(type: LogEntry['type'], content: string, data?: any) {
    return this.log({ type, level: 'warn', content, data })
  }

  error(type: LogEntry['type'], content: string, data?: any) {
    return this.log({ type, level: 'error', content, data })
  }

  debug(type: LogEntry['type'], content: string, data?: any) {
    return this.log({ type, level: 'debug', content, data })
  }
}

export const logger = new Logger()
