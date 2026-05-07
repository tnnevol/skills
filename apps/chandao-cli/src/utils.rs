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
                let truncated = if cell.len() > col_widths[i] {
                    format!("{}…", &cell[..col_widths[i].saturating_sub(1)])
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
