package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"

	"github.com/spf13/cobra"
	"halo-cli/internal/actions"
	"halo-cli/internal/api"
	"halo-cli/internal/env"
)

var rootCmd = &cobra.Command{
	Use:   "halo",
	Short: "Halo CMS CLI for managing blog posts",
	Long:  "A CLI tool to manage blog posts in Halo CMS (https://halo.run).",
}

// Execute executes the root command.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(getCmd)
	rootCmd.AddCommand(createCmd)
	rootCmd.AddCommand(updateCmd)
	rootCmd.AddCommand(deleteCmd)
	rootCmd.AddCommand(publishCmd)
	rootCmd.AddCommand(unpublishCmd)
	rootCmd.AddCommand(versionCmd)
}

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List blog posts",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := env.LoadEnv()
		if err != nil {
			return err
		}
		client := api.NewClient(cfg.BaseURL, cfg.PAT)
		return actions.ActionList(client, args)
	},
}

func init() {
	// Disable flag parsing for all commands since we handle flags in our own ParseFlags function
	listCmd.DisableFlagParsing = true
	getCmd.DisableFlagParsing = true
	createCmd.DisableFlagParsing = true
	updateCmd.DisableFlagParsing = true
	deleteCmd.DisableFlagParsing = true
	publishCmd.DisableFlagParsing = true
	unpublishCmd.DisableFlagParsing = true
	versionCmd.DisableFlagParsing = true
}

var getCmd = &cobra.Command{
	Use:   "get",
	Short: "Get a blog post by name",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := env.LoadEnv()
		if err != nil {
			return err
		}
		client := api.NewClient(cfg.BaseURL, cfg.PAT)
		return actions.ActionGet(client, args)
	},
}

var createCmd = &cobra.Command{
	Use:   "create",
	Short: "Create a new blog post",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := env.LoadEnv()
		if err != nil {
			return err
		}
		client := api.NewClient(cfg.BaseURL, cfg.PAT)
		return actions.ActionCreate(client, args)
	},
}

var updateCmd = &cobra.Command{
	Use:   "update",
	Short: "Update an existing blog post",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := env.LoadEnv()
		if err != nil {
			return err
		}
		client := api.NewClient(cfg.BaseURL, cfg.PAT)
		return actions.ActionUpdate(client, args)
	},
}

var deleteCmd = &cobra.Command{
	Use:   "delete",
	Short: "Delete a blog post",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := env.LoadEnv()
		if err != nil {
			return err
		}
		client := api.NewClient(cfg.BaseURL, cfg.PAT)
		return actions.ActionDelete(client, args)
	},
}

var publishCmd = &cobra.Command{
	Use:   "publish",
	Short: "Publish a blog post",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := env.LoadEnv()
		if err != nil {
			return err
		}
		client := api.NewClient(cfg.BaseURL, cfg.PAT)
		return actions.ActionPublish(client, args)
	},
}

var unpublishCmd = &cobra.Command{
	Use:   "unpublish",
	Short: "Unpublish a blog post",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := env.LoadEnv()
		if err != nil {
			return err
		}
		client := api.NewClient(cfg.BaseURL, cfg.PAT)
		return actions.ActionUnpublish(client, args)
	},
}

func getVersion() string {
	_, filename, _, _ := runtime.Caller(0)
	dir := filepath.Dir(filename)
	// go up to apps/halo/
	pkgPath := filepath.Join(dir, "..", "package.json")
	data, err := os.ReadFile(pkgPath)
	if err != nil {
		return "v1.0.1" // fallback
	}
	var pkg struct {
		Version string `json:"version"`
	}
	if err := json.Unmarshal(data, &pkg); err != nil {
		return "v1.0.1" // fallback
	}
	return "v" + pkg.Version
}

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("halo-cli " + getVersion())
	},
}
