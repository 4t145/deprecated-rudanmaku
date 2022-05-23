const LOGDIR:&'static str = "log";
const BUFFER_CAPACITY:usize = 512;
use std::fmt::Display;

use std::fs;
use std::path;
use std::path::PathBuf;
use chrono::{Local, DateTime};

pub struct Logger {
    file: path::PathBuf,
    buffer: Vec<LoggerItem>
}

pub enum Level {
    Info,
    Warn,
    Error,
}

pub struct LoggerItem {
    time: DateTime<Local>,
    tag: &'static str,
    message: String,
    level: Level
}

pub fn info(tag:&'static str, message:impl Into<String>) -> LoggerItem {
    LoggerItem {
        time: Local::now(),
        tag,
        message: message.into(),
        level: Level::Info,
    }
}

impl Display for LoggerItem {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_fmt(format_args!("[{}]\t{}", self.tag, self.message))
    }
}


impl Logger {

    pub fn new(file_path: PathBuf) -> Self {
        Self { file: file_path, buffer: Vec::with_capacity(BUFFER_CAPACITY) }
    }

    pub fn log(&mut self, log: LoggerItem) {
        self.buffer.push(log);
        if self.buffer.len() == BUFFER_CAPACITY {
            self.dump().unwrap_or_default()
        }
    }

    pub fn dump(&mut self) -> Result<(), Box<dyn std::error::Error>>{
        use std::io::Write;
        let mut file = fs::OpenOptions::new()
            .read(true)
            .append(true)
            .write(true)
            .create(true)
            .open(self.file.clone())?;
        for log in self.buffer.drain(..) {
            match log.level {
                Level::Info => {
                    file.write(format!("{}\n", log).as_bytes())?;
                },
                Level::Warn => todo!(),
                Level::Error => todo!(),
            }
        }
        return Ok(());
    }


}

impl Drop for Logger {
    fn drop(&mut self) {
        if !self.buffer.is_empty() {
            self.dump().unwrap_or_default();
        }
    }
}