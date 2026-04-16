package env

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Config holds the Halo CLI configuration.
type Config struct {
	BaseURL string
	PAT     string
}

// LoadEnv loads configuration with priority:
//
//	1. Environment variables (highest)
//	2. Skill directory .env file (apps/halo/)
//	3. Project root .env file (upward search)
//
// Returns a Config or an error if required variables are missing.
func LoadEnv() (*Config, error) {
	// Low priority first so high priority can overwrite.

	// Try project root .env
	projectRoot := findProjectRoot(".")
	if projectRoot != "" {
		parseEnvFileQuiet(filepath.Join(projectRoot, ".env"))
	}

	// Try skill directory .env (two levels up from this file's directory)
	skillDir := findSkillDir()
	if skillDir != "" {
		parseEnvFileQuiet(filepath.Join(skillDir, ".env"))
	}

	// Build config from accumulated env vars.
	cfg := &Config{
		BaseURL: strings.TrimSpace(os.Getenv("HALO_BASE_URL")),
		PAT:     strings.TrimSpace(os.Getenv("HALO_PAT")),
	}

	// Normalize BaseURL: remove trailing slashes.
	cfg.BaseURL = strings.TrimRight(cfg.BaseURL, "/")

	// Validate required fields.
	if cfg.BaseURL == "" {
		return nil, fmt.Errorf("缺少配置：HALO_BASE_URL 未设置，请在环境变量或 .env 文件中配置 Halo 实例地址")
	}
	if cfg.PAT == "" {
		return nil, fmt.Errorf("缺少配置：HALO_PAT 未设置，请在环境变量或 .env 文件中配置 Personal Access Token")
	}

	return cfg, nil
}

// parseEnvFileQuiet reads a .env file and sets key-value pairs via os.Setenv.
// Silently ignores missing files.
func parseEnvFileQuiet(filePath string) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return // File not found or unreadable — silently skip.
	}
	_ = parseEnvFileData(data)
}

// parseEnvFile parses .env file content and applies each key-value via os.Setenv.
// Ignores blank lines and lines starting with #.
// Supports quoted values: KEY="value" or KEY='value'.
func parseEnvFileData(data []byte) error {
	scanner := bufio.NewScanner(strings.NewReader(string(data)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// Skip empty lines and comments.
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Split on first '='.
		idx := strings.Index(line, "=")
		if idx < 0 {
			continue // No '=' found, skip malformed line.
		}

		key := strings.TrimSpace(line[:idx])
		value := strings.TrimSpace(line[idx+1:])

		if key == "" {
			continue
		}

		// Strip surrounding quotes if present.
		if len(value) >= 2 {
			if (value[0] == '"' && value[len(value)-1] == '"') ||
				(value[0] == '\'' && value[len(value)-1] == '\'') {
				value = value[1 : len(value)-1]
			}
		}

		// Only set if the env var is not already set (respect priority).
		if os.Getenv(key) == "" {
			_ = os.Setenv(key, value)
		}
	}
	return scanner.Err()
}

// parseEnvFile is the public version kept for API compatibility.
func parseEnvFile(filePath string) error {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("读取 .env 文件失败: %w", err)
	}
	return parseEnvFileData(data)
}

// findProjectRoot walks upward from startDir looking for .git or package.json.
// Returns the directory path, or empty string if not found.
func findProjectRoot(startDir string) string {
	abs, err := filepath.Abs(startDir)
	if err != nil {
		return ""
	}

	for {
		gitPath := filepath.Join(abs, ".git")
		packagePath := filepath.Join(abs, "package.json")
		if fileExists(gitPath) || fileExists(packagePath) {
			return abs
		}

		parent := filepath.Dir(abs)
		if parent == abs {
			break // Reached filesystem root.
		}
		abs = parent
	}

	return ""
}

// findSkillDir returns the apps/halo/ directory by walking up from the current
// source file's package directory.
func findSkillDir() string {
	// __FILE__ equivalent: use a known relative path from this package.
	// We walk up from the current working directory looking for apps/halo/.
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}

	abs, err := filepath.Abs(dir)
	if err != nil {
		return ""
	}

	for {
		candidate := filepath.Join(abs, "apps", "halo")
		if dirExists(candidate) {
			return candidate
		}

		parent := filepath.Dir(abs)
		if parent == abs {
			break
		}
		abs = parent
	}

	return ""
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir()
}

func dirExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return info.IsDir()
}
