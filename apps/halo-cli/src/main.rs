use halo_cli::actions;
use halo_cli::client::Client;
use halo_cli::env;

use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "halo", about = "A CLI tool to manage blog posts in Halo CMS (https://halo.run).")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// List blog posts
    List(actions::ListArgs),
    /// Get a blog post by name
    Get(actions::GetArgs),
    /// Create a new blog post
    Create(actions::CreateArgs),
    /// Update an existing blog post
    Update(actions::UpdateArgs),
    /// Delete a blog post
    Delete(actions::DeleteArgs),
    /// Publish a blog post
    Publish(actions::PublishArgs),
    /// Unpublish a blog post
    Unpublish(actions::UnpublishArgs),
    /// Print the version number
    Version,
}

fn main() {
    let cli = Cli::parse();

    let result = match &cli.command {
        Commands::Version => {
            println!("halo-cli {}", env!("CARGO_PKG_VERSION"));
            return;
        }
        Commands::List(args) => {
            let cfg = match env::Config::load() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("{}", e);
                    std::process::exit(1);
                }
            };
            let client = Client::new(cfg.base_url, cfg.pat);
            actions::action_list(&client, args)
        }
        Commands::Get(args) => {
            let cfg = match env::Config::load() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("{}", e);
                    std::process::exit(1);
                }
            };
            let client = Client::new(cfg.base_url, cfg.pat);
            actions::action_get(&client, args)
        }
        Commands::Create(args) => {
            let cfg = match env::Config::load() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("{}", e);
                    std::process::exit(1);
                }
            };
            let client = Client::new(cfg.base_url, cfg.pat);
            actions::action_create(&client, args)
        }
        Commands::Update(args) => {
            let cfg = match env::Config::load() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("{}", e);
                    std::process::exit(1);
                }
            };
            let client = Client::new(cfg.base_url, cfg.pat);
            actions::action_update(&client, args)
        }
        Commands::Delete(args) => {
            let cfg = match env::Config::load() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("{}", e);
                    std::process::exit(1);
                }
            };
            let client = Client::new(cfg.base_url, cfg.pat);
            actions::action_delete(&client, args)
        }
        Commands::Publish(args) => {
            let cfg = match env::Config::load() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("{}", e);
                    std::process::exit(1);
                }
            };
            let client = Client::new(cfg.base_url, cfg.pat);
            actions::action_publish(&client, args)
        }
        Commands::Unpublish(args) => {
            let cfg = match env::Config::load() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("{}", e);
                    std::process::exit(1);
                }
            };
            let client = Client::new(cfg.base_url, cfg.pat);
            actions::action_unpublish(&client, args)
        }
    };

    if let Err(e) = result {
        eprintln!("{}", e);
        std::process::exit(1);
    }
}
