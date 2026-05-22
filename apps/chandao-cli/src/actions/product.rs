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
pub enum ProductCommands {
    /// List products
    List {
        /// Browse type (unclosed, all, etc.)
        #[arg(short = 'b', long, default_value = "noclosed")]
        browse_type: String,
        /// Order by field (e.g., id_desc, name_asc)
        #[arg(short = 'o', long, default_value = "id_desc")]
        order_by: String,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get product details
    Get {
        /// Product ID
        id: i64,
    },
    /// Create a new product
    Create {
        /// Product name (required)
        #[arg(short, long)]
        name: String,
        /// Product code (required)
        #[arg(short, long)]
        code: String,
        /// Program/Project ID
        #[arg(long)]
        program: Option<i64>,
        /// Line ID
        #[arg(long)]
        line: Option<i64>,
        /// Product type (normal, multi-branch, platform, etc.)
        #[arg(short = 'y', long, default_value = "normal")]
        r#type: String,
        /// Status (normal, closed)
        #[arg(short, long, default_value = "normal")]
        status: Option<String>,
        /// Product Owner
        #[arg(long)]
        po: Option<String>,
        /// QA Director
        #[arg(long)]
        qd: Option<String>,
        /// R&D Director
        #[arg(long)]
        rd: Option<String>,
        /// Reviewers
        #[arg(long)]
        reviewer: Option<String>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// ACL type (open, private, custom)
        #[arg(long)]
        acl: Option<String>,
        /// Whitelist users (comma-separated)
        #[arg(long, value_delimiter = ',')]
        whitelist: Option<Vec<String>>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a product
    Update {
        /// Product ID
        id: i64,
        /// Product name
        #[arg(short, long)]
        name: Option<String>,
        /// Product code
        #[arg(short, long)]
        code: Option<String>,
        /// Program/Project ID
        #[arg(long)]
        program: Option<i64>,
        /// Line ID
        #[arg(long)]
        line: Option<i64>,
        /// Product type (normal, multi-branch, platform, etc.)
        #[arg(short = 'y', long)]
        r#type: Option<String>,
        /// Status (normal, closed)
        #[arg(short, long)]
        status: Option<String>,
        /// Product Owner
        #[arg(long)]
        po: Option<String>,
        /// QA Director
        #[arg(long)]
        qd: Option<String>,
        /// R&D Director
        #[arg(long)]
        rd: Option<String>,
        /// Reviewers
        #[arg(long)]
        reviewer: Option<String>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// ACL type (open, private, custom)
        #[arg(long)]
        acl: Option<String>,
        /// Whitelist users (comma-separated)
        #[arg(long, value_delimiter = ',')]
        whitelist: Option<Vec<String>>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a product
    Delete {
        /// Product ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// List products by program
    ListByProgram {
        /// Program ID
        #[arg(short, long)]
        program: i64,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
}


pub fn handle_product(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &ProductCommands,
) -> Result<(), String> {
    match cmd {
        ProductCommands::List {
            browse_type,
            order_by,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/products?browseType={}&orderBy={}&recPerPage={}&pageID={}",
                    browse_type, order_by, limit, page
                ))?;
                utils::print_table(
                    &data,
                    &["id", "name", "code", "status", "PO", "QD", "RD", "type"],
                );
                Ok(())
            })
        }
        ProductCommands::Get { id } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!("/products/{}", id))?;
                utils::print_json(&data);
                Ok(())
            })
        }
        ProductCommands::Create {
            name,
            code,
            program,
            line,
            r#type,
            status,
            po,
            qd,
            rd,
            reviewer,
            desc,
            acl,
            whitelist,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建产品: name={}, code={}",
                    name, code
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "name": name,
                    "code": code,
                });
                if let Some(v) = program {
                    body["program"] = json!(v);
                }
                if let Some(v) = line {
                    body["line"] = json!(v);
                }
                body["type"] = json!(r#type);
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                if let Some(v) = po {
                    body["PO"] = json!(v);
                }
                if let Some(v) = qd {
                    body["QD"] = json!(v);
                }
                if let Some(v) = rd {
                    body["RD"] = json!(v);
                }
                if let Some(v) = reviewer {
                    body["reviewer"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = acl {
                    body["acl"] = json!(v);
                }
                if let Some(v) = whitelist {
                    body["whitelist"] = json!(v);
                }
                let result = ac.post("/products", &body)?;
                println!("✅ 产品创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        ProductCommands::Update {
            id,
            name,
            code,
            program,
            line,
            r#type,
            status,
            po,
            qd,
            rd,
            reviewer,
            desc,
            acl,
            whitelist,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新产品 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(v) = name {
                    body["name"] = json!(v);
                }
                if let Some(v) = code {
                    body["code"] = json!(v);
                }
                if let Some(v) = program {
                    body["program"] = json!(v);
                }
                if let Some(v) = line {
                    body["line"] = json!(v);
                }
                if let Some(v) = r#type {
                    body["type"] = json!(v);
                }
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                if let Some(v) = po {
                    body["PO"] = json!(v);
                }
                if let Some(v) = qd {
                    body["QD"] = json!(v);
                }
                if let Some(v) = rd {
                    body["RD"] = json!(v);
                }
                if let Some(v) = reviewer {
                    body["reviewer"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = acl {
                    body["acl"] = json!(v);
                }
                if let Some(v) = whitelist {
                    body["whitelist"] = json!(v);
                }
                let result = ac.put(&format!("/products/{}", id), &body)?;
                println!("✅ 产品 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        ProductCommands::Delete { id, yes, dry_run } => {
            if !yes && !*dry_run {
                println!("⚠️  确认删除产品 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除产品 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/products/{}", id))?;
                println!("✅ 产品 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        ProductCommands::ListByProgram {
            program,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/programs/{}/products?pageID={}&recPerPage={}",
                    program, page, limit
                ))?;
                utils::print_table(
                    &data,
                    &["id", "name", "code", "status", "PO", "type"],
                );
                Ok(())
            })
        }
    }
}

