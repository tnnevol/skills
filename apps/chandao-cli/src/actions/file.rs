use clap::Subcommand;
use serde_json::json;
use std::cell::RefCell;
use std::rc::Rc;

use crate::utils;
use crate::auth::AuthManager;
use crate::client::{Client, AuthenticatedClient};

macro_rules! with_auth {
    ($client:expr, $auth:expr, $body:expr) => {{
        let mut ac = $client.authenticate($auth)?;
        $body(&mut ac)
    }};
}



#[derive(Subcommand)]
pub enum FileCommands {
    /// Upload a file
    Upload {
        /// Path to the file to upload
        #[arg(short, long)]
        file: String,
        /// Optional title/name for the file
        #[arg(long)]
        title: Option<String>,
        /// Object type (story, task, bug, etc.)
        #[arg(short = 't', long)]
        object_type: Option<String>,
        /// Object ID
        #[arg(short = 'i', long)]
        object_id: Option<i64>,
    },
    /// Edit/rename a file
    Edit {
        /// File ID
        #[arg(short, long)]
        id: i64,
        /// New title/name
        #[arg(short, long)]
        title: String,
    },
    /// Delete a file
    Delete {
        /// File ID
        #[arg(short, long)]
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
    },
}


pub fn handle_file(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &FileCommands,
) -> Result<(), String> {
    match cmd {
        FileCommands::Upload {
            file,
            title,
            object_type,
            object_id,
        } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let mut fields: Vec<(&str, &str)> = Vec::new();
            if let Some(t) = title {
                fields.push(("title", t.as_str()));
            }
            if let Some(ot) = object_type {
                fields.push(("objectType", ot.as_str()));
            }
            let object_id_str;
            if let Some(oi) = object_id {
                object_id_str = oi.to_string();
                fields.push(("objectId", &object_id_str));
            }
            let result = ac.post_multipart("/files", &fields, "file", file, None)?;
            println!("✅ 文件上传成功");
            utils::print_json(&result);
            Ok(())
        }),
        FileCommands::Edit { id, title } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let body = serde_json::json!({ "title": title });
            let result = ac.put(&format!("/files/{}", id), &body)?;
            println!("✅ 文件 #{} 已重命名", id);
            utils::print_json(&result);
            Ok(())
        }),
        FileCommands::Delete { id, yes } => {
            if !yes {
                println!("⚠️  确认删除文件 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/files/{}", id))?;
                println!("✅ 文件 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

