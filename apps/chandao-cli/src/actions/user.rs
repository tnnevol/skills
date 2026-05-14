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
pub enum UserCommands {
    /// List users
    List {
        /// Order by field (e.g., id_desc, account_asc)
        #[arg(short = 'o', long, default_value = "id_desc")]
        order_by: String,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Results per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get user details
    Get {
        /// User ID or account name
        id: String,
    },
    /// Create a new user
    Create {
        /// Account name (required)
        #[arg(short, long)]
        account: String,
        /// Real name (required)
        #[arg(short, long)]
        realname: String,
        /// Password (required)
        #[arg(short, long)]
        password: String,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a user
    Update {
        /// User ID
        id: i64,
        /// Real name
        #[arg(short, long)]
        realname: Option<String>,
        /// Password
        #[arg(short, long)]
        password: Option<String>,
        /// Email
        #[arg(short = 'e', long)]
        email: Option<String>,
        /// Phone
        #[arg(short = 'p', long)]
        phone: Option<String>,
        /// Role
        #[arg(short = 'r', long)]
        role: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a user
    Delete {
        /// User ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_user(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &UserCommands,
) -> Result<(), String> {
    match cmd {
        UserCommands::List {
            order_by,
            page,
            limit,
        } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!(
                "/users?orderBy={}&recPerPage={}&pageID={}",
                order_by, limit, page
            ))?;
            utils::print_table(
                &data,
                &["id", "account", "realname", "email", "phone", "role", "status"],
            );
            Ok(())
        }),
        UserCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            // Support both numeric ID and account name
            let path = format!("/users/{}", id);
            let data = ac.get(&path)?;
            utils::print_json(&data);
            Ok(())
        }),
        UserCommands::Create {
            account,
            realname,
            password,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建用户: account={}, realname={}",
                    account, realname
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let body = json!({
                    "account": account,
                    "realname": realname,
                    "password": password,
                });
                let result = ac.post("/users", &body)?;
                println!("✅ 用户创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        UserCommands::Update {
            id,
            realname,
            password,
            email,
            phone,
            role,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新用户 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(v) = realname {
                    body["realname"] = json!(v);
                }
                if let Some(v) = password {
                    body["password"] = json!(v);
                }
                if let Some(v) = email {
                    body["email"] = json!(v);
                }
                if let Some(v) = phone {
                    body["phone"] = json!(v);
                }
                if let Some(v) = role {
                    body["role"] = json!(v);
                }
                let result = ac.put(&format!("/users/{}", id), &body)?;
                println!("✅ 用户 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        UserCommands::Delete { id, yes, dry_run } => {
            if !yes && !dry_run {
                println!("⚠️  确认删除用户 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除用户 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/users/{}", id))?;
                println!("✅ 用户 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

