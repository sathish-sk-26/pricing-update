# Secondary Button Actions

_Started 2026-06-06 18:15 UTC_

---

## User

make the action as a secondary buttons

## Assistant

_[tool: read_file]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

I'll update the Deprecate / Go live action buttons to use the neutral secondary button style — dropping the amber/green color treatments so they read as standard secondary actions.

_[tool: done]_

Done — Deprecate and Go live now render as neutral secondary buttons (white bg, gray border, gray text), with the colored amber/green treatments removed.

## User

blue button

## Assistant

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

Switched Deprecate and Go live to the brand blue primary style (`--hr-background-primary-default` / `#0056d2`, white text, darker hover).

## User

make the primary cta to blue

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

Switched the "Create pricing draft" CTA from purple to brand blue (`--hr-background-primary-default` / `#0056d2`, darker on hover).

## User

Deprecate and live CTA make it secondary action

## Assistant

_[tool: str_replace_edit]_

_[tool: done]_

Deprecate and Go live are now neutral secondary buttons (white bg, gray border/text, light gray hover).

## User

add icons to these button

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Added an archive icon to Deprecate and a power icon to Go live, sized 14px and aligned with a 6px gap from the label.

## User

more action is getting hidden in the table

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

Widened the actions column from 130px → 170px so the Deprecate/Go live button + the 3-dot menu both fit on a single line without clipping.

## User

by clicking on the add plan in the draft should use the setup add plan modal

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

The draft view's "Add plan" button now opens the same PlanModal used in setup, and "Edit plan" from the row menu opens it pre-filled.

## User

by clicking on the add meter in the  Billing meters should use the setup add meter modal

## Assistant

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

The draft view's "Add meter" button (and edit on a meter row) now opens the same MeterModal used in setup.

## User

make the "Discard" "Publish draft" actions as a footer

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: read_file]_

Good — structure is fine. Now CSS for the sticky footer.

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Moved Discard and Publish draft into a sticky bottom footer (with a publish-state hint on the left); the header now shows only the title, status, and version tag.

## User

Verifier agent check completed

## User

Add preview action in the Ppub-header right side

## User

Add preview action in the Ppub-header right side

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Added a secondary "Preview" button (eye icon) on the right side of the draft pub-header. Discard/Publish stay in the sticky footer.

## User

add red to the delete actions

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: str_replace_edit]_

_[tool: done]_

The trash icons are rendering gray because the base button rule has higher specificity than `.del`. Let me fix the cascade so delete actions actually show red.

_[tool: show_html]_

_[tool: str_replace_edit]_

_[tool: show_html]_

Trash icons on the plan rows now render in error red, with a coral hover wash on the icon button.

## User

by clicking on depricate button it should show the warning modal with the message in the reference and the options for the existing plan.

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now add the CSS for the modal options and wire it up to the Deprecate button.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Clicking Deprecate on a live plan now opens a confirmation modal with the alert-triangle header, the warning copy, and the two-option radio for handling existing subscribers (Grandfather vs. Notify + T+30, Notify selected by default). Confirming flips the plan to deprecated; Go live still flips back instantly without a modal.

## User

make the options verticle

## Assistant

_[tool: str_replace_edit]_

_[tool: done]_

The two policy options now stack vertically.

## User

Remove.  
Mark Pro as deprecating?

 You are not selecting a migration target — subscribers choose their own new plan.

## Assistant

_[tool: str_replace_edit]_

_[tool: done]_

Trimmed the modal subtitle down to just "Existing subscribers will be notified according to your chosen policy."

## User

increase the width of the modal to 10%

## Assistant

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

Confirm-modal max-width bumped from 520px → 572px (+10%).

## User

After deprecation, show the which Policy it got depricated inside the table

## Assistant

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Deprecated plan rows now show a small chip next to the status pill — "Grandfathered" or "Notify · T+30" depending on the policy chosen, with a tooltip explaining each.

## User

add policy icon as well

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Added a small icon to the policy chip — shield for "Grandfathered", bell for "Notify · T+30".

