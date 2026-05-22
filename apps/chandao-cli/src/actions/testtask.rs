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
pub enum TesttaskCommands {
    /// List test tasks (requires --product)
    List {
        /// Product ID
        #[arg(short = 'p', long)]
        product: i64,
        /// Browse type (all, unfinished, blocked)
        #[arg(short = 'b', long, default_value = "all")]
        browse: String,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// List test tasks by product
    ListByProduct {
        /// Product ID
        #[arg(short = 'p', long)]
        product: i64,
        /// Browse type (all, unfinished, blocked)
        #[arg(short = 'b', long, default_value = "all")]
        browse: String,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Results per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// List test tasks by project
    ListByProject {
        /// Project ID
        #[arg(short = 'j', long)]
        project: i64,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Results per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// List test tasks by execution/sprint
    ListByExecution {
        /// Execution ID
        #[arg(short = 'e', long)]
        execution: i64,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Results per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Create a test task
    Create {
        /// Product ID (required)
        #[arg(short = 'p', long)]
        product: i64,
        /// Test task name (required)
        #[arg(short, long)]
        name: String,
        /// Build ID (required)
        #[arg(short = 'b', long)]
        build: i64,
        /// Begin date (YYYY-MM-DD, required)
        #[arg(long)]
        begin: String,
        /// End date (YYYY-MM-DD, required)
        #[arg(long)]
        end: String,
        /// Project ID
        #[arg(short = 'j', long)]
        project: Option<i64>,
        /// Execution ID
        #[arg(short = 'e', long)]
        execution: Option<i64>,
        /// Assigned to
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        /// Priority (1-4)
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        /// Description
        #[arg(short = 'd', long)]
        desc: Option<String>,
        /// Status (wait/doing/blocked/done)
        #[arg(short = 's', long)]
        status: Option<String>,
        /// Module ID
        #[arg(short = 'm', long)]
        module: Option<i64>,
        /// Test report
        #[arg(long)]
        report: Option<String>,
        /// Mailto (comma-separated accounts)
        #[arg(long, value_delimiter = ',')]
        mailto: Option<Vec<String>>,
        /// Story IDs (comma-separated)
        #[arg(long, value_delimiter = ',')]
        stories: Option<Vec<i64>>,
        /// Link test cases
        #[arg(long, value_delimiter = ',')]
        linkcases: Option<Vec<i64>>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a test task
    Update {
        /// Test task ID
        id: i64,
        /// New name
        #[arg(short, long)]
        name: Option<String>,
        /// New assigned to
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        /// New priority
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        /// New status
        #[arg(short = 's', long)]
        status: Option<String>,
        /// New description
        #[arg(short = 'd', long)]
        desc: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a test task
    Delete {
        /// Test task ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_testtask(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &TesttaskCommands,
) -> Result<(), String> {
    match cmd {
        TesttaskCommands::List { product, browse, page, limit }
        | TesttaskCommands::ListByProduct {
            product,
            browse,
            page,
            limit,
        } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!(
                "/products/{product}/testtasks?browseType={browse}&pageID={page}&recPerPage={limit}"
            ))?;
            utils::print_table(
                &data,
                &[
                    "id",
                    "name",
                    "status",
                    "assignedTo",
                    "pri",
                    "begin",
                    "end",
                    "productName",
                ],
            );
            Ok(())
        }),
        TesttaskCommands::ListByProject {
            project,
            page,
            limit,
        } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!(
                "/projects/{project}/testtasks?pageID={page}&recPerPage={limit}"
            ))?;
            utils::print_table(
                &data,
                &[
                    "id",
                    "name",
                    "status",
                    "assignedTo",
                    "pri",
                    "begin",
                    "end",
                    "productName",
                ],
            );
            Ok(())
        }),
        TesttaskCommands::ListByExecution {
            execution,
            page,
            limit,
        } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!(
                "/executions/{execution}/testtasks?pageID={page}&recPerPage={limit}"
            ))?;
            utils::print_table(
                &data,
                &[
                    "id",
                    "name",
                    "status",
                    "assignedTo",
                    "pri",
                    "begin",
                    "end",
                    "productName",
                ],
            );
            Ok(())
        }),
        TesttaskCommands::Create {
            product,
            name,
            project,
            execution,
            build,
            assigned,
            pri,
            begin,
            end,
            desc,
            status,
            module,
            report,
            mailto,
            stories,
            linkcases,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 创建测试单: {name}, product={product}");
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "productID": product,
                    "name": name,
                });
                if let Some(v) = project {
                    body["project"] = json!(v);
                }
                if let Some(v) = execution {
                    body["execution"] = json!(v);
                }
                body["build"] = json!(build);
                if let Some(v) = assigned {
                    body["assignedTo"] = json!(v);
                }
                if let Some(v) = pri {
                    body["pri"] = json!(v);
                }
                body["begin"] = json!(begin);
                body["end"] = json!(end);
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                if let Some(v) = module {
                    body["module"] = json!(v);
                }
                if let Some(v) = report {
                    body["report"] = json!(v);
                }
                if let Some(v) = mailto {
                    body["mailto"] = json!(v);
                }
                if let Some(v) = stories {
                    body["stories"] = json!(v);
                }
                if let Some(v) = linkcases {
                    body["linkcases"] = json!(v);
                }
                let result = ac.post("/testtasks", &body)?;
                println!("✅ 测试单创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        TesttaskCommands::Update {
            id,
            name,
            assigned,
            pri,
            status,
            desc,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新测试单 #{id}");
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(v) = name {
                    body["name"] = json!(v);
                }
                if let Some(v) = assigned {
                    body["assignedTo"] = json!(v);
                }
                if let Some(v) = pri {
                    body["pri"] = json!(v);
                }
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                let result = ac.put(&format!("/testtasks/{id}"), &body)?;
                println!("✅ 测试单 #{id} 更新成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        TesttaskCommands::Delete { id, yes, dry_run } => {
            if !yes && !*dry_run {
                println!("⚠️  确认删除测试单 #{id}? 使用 --yes 确认");
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除测试单 #{id}");
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/testtasks/{id}"))?;
                println!("✅ 测试单 #{id} 已删除");
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

