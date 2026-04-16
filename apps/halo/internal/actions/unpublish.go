package actions

import (
	"halo-cli/internal/api"
)

// ActionUnpublish unpublishes a post by name.
// Usage: unpublish <name>
func ActionUnpublish(client *api.Client, args []string) error {
	return actionPublishUnpublish(client, args, false)
}
