use chandao_cli::actions;
use chandao_cli::auth::AuthManager;
use chandao_cli::client::Client;
use chandao_cli::env;
use clap::{Parser, Subcommand};
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Parser)]
#[command(
    name = "chandao",
    about = "禅道 (ZenTao) CLI — manage projects, tasks, bugs, stories via RESTful API v2"
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Manage executions/sprints
    #[command(subcommand)]
    Execution(actions::ExecutionCommands),
    /// Manage stories
    #[command(subcommand)]
    Story(actions::StoryCommands),
    /// Manage tasks
    #[command(subcommand)]
    Task(actions::TaskCommands),
    /// Manage bugs
    #[command(subcommand)]
    Bug(actions::BugCommands),
    /// Manage test cases
    #[command(subcommand)]
    Testcase(actions::TestcaseCommands),
    /// Manage application systems
    #[command(subcommand)]
    System(actions::SystemCommands),
    /// Manage products
    #[command(subcommand)]
    Product(actions::ProductCommands),
    /// Manage file attachments
    #[command(subcommand)]
    File(actions::FileCommands),
    /// Print version
    Version,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Version => {
            println!("chandao-cli {}", env!("CARGO_PKG_VERSION"));
            return Ok(());
        }
        _ => {}
    }

    let cfg = env::Config::load().map_err(|e| {
        eprintln!("{}", e);
        std::process::exit(1);
    })?;

    let client = Client::new(cfg.base_url);
    let auth = Rc::new(RefCell::new(AuthManager::new(cfg.account, cfg.password)));

    let result = match &cli.command {
        Commands::Execution(args) => actions::handle_execution(&client, &auth, args),
        Commands::Story(args) => actions::handle_story(&client, &auth, args),
        Commands::Task(args) => actions::handle_task(&client, &auth, args),
        Commands::Bug(args) => actions::handle_bug(&client, &auth, args),
        Commands::Testcase(args) => actions::handle_testcase(&client, &auth, args),
        Commands::System(args) => actions::handle_system(&client, &auth, args),
        Commands::Product(args) => actions::handle_product(&client, &auth, args),
        Commands::File(args) => actions::handle_file(&client, &auth, args),
        _ => unreachable!(),
    };

    if let Err(e) = result {
        eprintln!("{}", e);
        std::process::exit(1);
    }

    Ok(())
}
