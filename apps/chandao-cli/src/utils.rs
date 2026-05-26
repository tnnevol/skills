//! Utility functions for output formatting.
//!
//! Provides table printing (for list views) and JSON pretty-printing (for detail views).

use serde_json::Value;

/// Print a JSON value as pretty-printed JSON.
pub fn print_json(data: &Value) {
    println!("{}", serde_json::to_string_pretty(data).unwrap_or_default());
}

/// Print a list of items as a table.
///
/// Expects `data` to be an array of objects. Each object's fields
/// matching `fields` become columns.
pub fn print_table(data: &Value, fields: &[&str]) {
    let arr = match data {
        Value::Array(a) => a,
        Value::Object(_) => {
            // Single object — treat as one-row table
            print_object_row(data, fields);
            return;
        }
        _ => {
            println!("(no data)");
            return;
        }
    };

    if arr.is_empty() {
        println!("📭 暂无数据");
        return;
    }

    // Collect rows
    let rows: Vec<Vec<String>> = arr
        .iter()
        .map(|item| {
            fields
                .iter()
                .map(|f| {
                    let val = item.get(f).and_then(|v| match v {
                        Value::Null => None,
                        other => Some(other.to_string().trim_matches('"').to_string()),
                    });
                    val.unwrap_or_else(|| "-".to_string())
                })
                .collect()
        })
        .collect();

    // Calculate column widths
    let headers: Vec<String> = fields.iter().map(|f| f.to_string()).collect();
    let col_widths: Vec<usize> = headers
        .iter()
        .enumerate()
        .map(|(i, h)| {
            let max_content = rows
                .iter()
                .map(|r| r[i].chars().count())
                .max()
                .unwrap_or(0);
            std::cmp::max(h.chars().count(), max_content)
        })
        .collect();

    // Print header
    let header_line: Vec<String> = headers
        .iter()
        .enumerate()
        .map(|(i, h)| format!("{:^width$}", h, width = col_widths[i]))
        .collect();
    println!("| {} |", header_line.join(" | "));

    // Print separator
    let sep_line: Vec<String> = col_widths
        .iter()
        .map(|w| "-".repeat(*w))
        .collect();
    println!("| {} |", sep_line.join(" | "));

    // Print rows
    for row in &rows {
        let row_line: Vec<String> = row
            .iter()
            .enumerate()
            .map(|(i, cell)| {
                let truncated = if cell.chars().count() > col_widths[i] {
                    let truncated_chars: String = cell.chars().take(col_widths[i].saturating_sub(1)).collect();
                    format!("{}…", truncated_chars)
                } else {
                    format!("{:width$}", cell, width = col_widths[i])
                };
                truncated
            })
            .collect();
        println!("| {} |", row_line.join(" | "));
    }

    println!("\n共 {} 条", arr.len());
}

/// Print a list of items as a table with pagination hint.
///
/// If `limit` is provided and the returned count equals or exceeds it,
/// a hint is shown suggesting the user to query the next page.
pub fn print_list(data: &Value, fields: &[&str], limit: Option<u32>) {
    // Extract array and total from response
    let (arr, total) = match data {
        Value::Array(a) => (a, None),
        Value::Object(obj) => {
            // Try to find array in common API response fields
            let arr = obj.get("data")
                .or_else(|| obj.get("tasks"))
                .or_else(|| obj.get("bugs"))
                .or_else(|| obj.get("stories"))
                .or_else(|| obj.get("executions"))
                .or_else(|| obj.get("products"))
                .or_else(|| obj.get("projects"))
                .or_else(|| obj.get("users"))
                .or_else(|| obj.get("testcases"))
                .or_else(|| obj.get("testtasks"))
                .or_else(|| obj.get("builds"))
                .or_else(|| obj.get("releases"))
                .or_else(|| obj.get("plans"))
                .or_else(|| obj.get("programs"))
                .or_else(|| obj.get("epics"))
                .and_then(|v| v.as_array());

            // Try to find total in common API response fields
            let total = obj.get("total")
                .or_else(|| obj.get("total_rec"))
                .or_else(|| obj.get("recTotal"))
                .and_then(|v| v.as_u64());

            match arr {
                Some(a) => (a, total),
                None => {
                    // Single object — treat as one-row table
                    print_object_row(data, fields);
                    return;
                }
            }
        }
        _ => {
            println!("(no data)");
            return;
        }
    };

    if arr.is_empty() {
        println!("📭 暂无数据");
        return;
    }

    // Collect rows
    let rows: Vec<Vec<String>> = arr
        .iter()
        .map(|item| {
            fields
                .iter()
                .map(|f| {
                    let val = item.get(f).and_then(|v| match v {
                        Value::Null => None,
                        other => Some(other.to_string().trim_matches('"').to_string()),
                    });
                    val.unwrap_or_else(|| "-".to_string())
                })
                .collect()
        })
        .collect();

    // Calculate column widths
    let headers: Vec<String> = fields.iter().map(|f| f.to_string()).collect();
    let col_widths: Vec<usize> = headers
        .iter()
        .enumerate()
        .map(|(i, h)| {
            let max_content = rows
                .iter()
                .map(|r| r[i].chars().count())
                .max()
                .unwrap_or(0);
            std::cmp::max(h.chars().count(), max_content)
        })
        .collect();

    // Print header
    let header_line: Vec<String> = headers
        .iter()
        .enumerate()
        .map(|(i, h)| format!("{:^width$}", h, width = col_widths[i]))
        .collect();
    println!("| {} |", header_line.join(" | "));

    // Print separator
    let sep_line: Vec<String> = col_widths
        .iter()
        .map(|w| "-".repeat(*w))
        .collect();
    println!("| {} |", sep_line.join(" | "));

    // Print rows
    for row in &rows {
        let row_line: Vec<String> = row
            .iter()
            .enumerate()
            .map(|(i, cell)| {
                let truncated = if cell.chars().count() > col_widths[i] {
                    let truncated_chars: String = cell.chars().take(col_widths[i].saturating_sub(1)).collect();
                    format!("{}…", truncated_chars)
                } else {
                    format!("{:width$}", cell, width = col_widths[i])
                };
                truncated
            })
            .collect();
        println!("| {} |", row_line.join(" | "));
    }

    // Print count with total and pagination hint
    match total {
        Some(t) if t > arr.len() as u64 => {
            println!("\n共 {} 条 (总数: {} 条，仅显示当前页)", arr.len(), t);
            println!("💡 还有 {} 条未显示，请使用 --page 参数查看下一页", t - arr.len() as u64);
        }
        _ if limit.is_some() && (arr.len() as u32) >= limit.unwrap_or(u32::MAX) => {
            println!("\n共 {} 条", arr.len());
            println!("💡 结果数量已达上限 (limit={})，可能还有更多数据，请使用 --page 参数查看", limit.unwrap());
        }
        _ => println!("\n共 {} 条", arr.len()),
    }
}

fn print_object_row(obj: &Value, fields: &[&str]) {
    let row: Vec<String> = fields
        .iter()
        .map(|f| {
            let val = obj
                .get(f)
                .and_then(|v| match v {
                    Value::Null => None,
                    other => Some(other.to_string().trim_matches('"').to_string()),
                })
                .unwrap_or_else(|| "-".to_string());
            val
        })
        .collect();
    println!("| {} |", row.join(" | "));
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_print_json() {
        let data = json!({"id": 1, "name": "test"});
        // Just ensure it doesn't panic
        print_json(&data);
    }

    #[test]
    fn test_print_table_empty() {
        let data = json!([]);
        print_table(&data, &["id", "name"]);
    }

    #[test]
    fn test_print_table_with_data() {
        let data = json!([
            {"id": 1, "name": "Task A", "status": "done"},
            {"id": 2, "name": "Task B", "status": "wait"},
        ]);
        print_table(&data, &["id", "name", "status"]);
    }

    #[test]
    fn test_print_table_single_object() {
        let data = json!({"id": 1, "name": "Test", "status": "doing"});
        print_table(&data, &["id", "name", "status"]);
    }

    #[test]
    fn test_print_table_missing_field() {
        let data = json!([
            {"id": 1, "name": "Task A"},
            {"id": 2},  // missing "name"
        ]);
        print_table(&data, &["id", "name"]);
    }
}
