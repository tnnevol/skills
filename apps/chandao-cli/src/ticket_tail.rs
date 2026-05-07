        }
    }
}

// ── Ticket ──

#[derive(Subcommand)]
pub enum TicketCommands {
    /// List tickets by product
    ListByProduct {
        /// Product ID
        #[arg(short = 'p', long)]
        product: i64,
        /// Page number
        #[arg(short, long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get ticket details
    Get {
        /// Ticket ID
        id: i64,
    },
    /// Create a ticket
    Create {
        /// Product ID (required)
        #[arg(short = 'p', long)]
        product: i64,
        /// Title (required)
        #[arg(short, long)]
        title: String,
        /// Keywords for feedback
        #[arg(short, long)]
        keywords: Option<String>,
        /// Assigned to
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        /// Priority (1-4)
        #[arg(short, long)]
        pri: Option<u8>,
        /// Type
        #[arg(short, long)]
        r#type: Option<String>,
        /// Module ID
        #[arg(short = 'm', long)]
        module: Option<i64>,
        /// Description
        #[arg(short = 'd', long)]
        desc: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a ticket
    Update {
        /// Ticket ID
        id: i64,
        /// Title
        #[arg(short, long)]
        title: Option<String>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Assigned to
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        /// Priority (1-4)
        #[arg(short, long)]
        pri: Option<u8>,
        /// Status
        #[arg(short, long)]
        status: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Close a ticket
    Close {
        /// Ticket ID
        id: i64,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Activate a closed ticket
    Activate {
        /// Ticket ID
        id: i64,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a ticket
    Delete {
        /// Ticket ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}

pub fn handle_ticket(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &TicketCommands,
) -> Result<(), String> {
    match cmd {
        TicketCommands::ListByProduct {
            product,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/products/{product}/tickets?pageID={page}&recPerPage={limit}"
                ))?;
                utils::print_table(
                    &data,
                    &[
                        "id",
                        "title",
                        "status",
                        "pri",
                        "assignedTo",
                        "openedDate",
                        "productName",
                    ],
                );
                Ok(())
            })
        }
        TicketCommands::Get { id } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!("/tickets/{id}"))?;
                utils::print_json(&data);
                Ok(())
            })
        }
        TicketCommands::Create {
            product,
            title,
            keywords,
            assigned,
            pri,
            r#type,
            module,
            desc,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建工单: title={title}, product={product}"
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "product": product,
                    "title": title,
                });
                if let Some(v) = keywords {
                    body["keywords"] = json!(v);
                }
                if let Some(v) = assigned {
                    body["assignedTo"] = json!(v);
                }
                if let Some(v) = pri {
                    body["pri"] = json!(v);
                }
                if let Some(v) = r#type {
                    body["type"] = json!(v);
                }
                if let Some(v) = module {
                    body["module"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                let result = ac.post("/tickets", &body)?;
                println!("✅ 工单创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        TicketCommands::Update {
            id,
            title,
            desc,
            assigned,
            pri,
            status,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新工单 #{id}");
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(v) = title {
                    body["title"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
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
                let result = ac.put(&format!("/tickets/{id}"), &body)?;
                println!("✅ 工单 #{id} 更新成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        TicketCommands::Close { id, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 关闭工单 #{id}");
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.put(&format!("/tickets/{id}/close"), &json!({}))?;
                println!("✅ 工单 #{id} 已关闭");
                utils::print_json(&result);
                Ok(())
            })
        }
        TicketCommands::Activate { id, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 激活工单 #{id}");
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.put(&format!("/tickets/{id}/activate"), &json!({}))?;
                println!("✅ 工单 #{id} 已激活");
                utils::print_json(&result);
                Ok(())
            })
        }
        TicketCommands::Delete { id, yes, dry_run } => {
            if !yes && !*dry_run {
                println!("⚠️  确认删除工单 #{id}? 使用 --yes 确认");
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除工单 #{id}");
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/tickets/{id}"))?;
                println!("✅ 工单 #{id} 已删除");
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}
