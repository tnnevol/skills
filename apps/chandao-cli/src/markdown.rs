//! Markdown to HTML conversion utility.
//!
//! Uses pulldown-cmark for rendering.

use pulldown_cmark::{html, Parser};

/// Convert Markdown text to HTML.
pub fn markdown_to_html(md: &str) -> String {
    let parser = Parser::new(md);
    let mut html = String::new();
    html::push_html(&mut html, parser);
    html
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_markdown_to_html_simple() {
        let md = "# Hello\n\nThis is **bold** text.";
        let html = markdown_to_html(md);
        assert!(html.contains("<h1>"));
        assert!(html.contains("<strong>"));
    }

    #[test]
    fn test_markdown_to_html_code_block() {
        let md = "```rust\nfn main() {}\n```";
        let html = markdown_to_html(md);
        assert!(html.contains("<code"));
        assert!(html.contains("fn main"));
    }

    #[test]
    fn test_markdown_to_html_empty() {
        let html = markdown_to_html("");
        assert_eq!(html, "");
    }

    #[test]
    fn test_markdown_to_html_list() {
        let md = "- Item 1\n- Item 2\n- Item 3";
        let html = markdown_to_html(md);
        assert!(html.contains("<ul>"));
        assert!(html.contains("<li>"));
    }
}
