---
name: Modern Editorial
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c9c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e0dfdf'
  on-secondary-container: '#626362'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d0506'
  on-tertiary-container: '#c26b65'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e3e2e1'
  secondary-fixed-dim: '#c7c6c5'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#464746'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#3d0506'
  on-tertiary-fixed-variant: '#77302d'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-xl:
    fontFamily: Bodoni Moda
    fontSize: 120px
    fontWeight: '800'
    lineHeight: 110px
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 80px
    fontWeight: '800'
    lineHeight: 84px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  ui-label:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.1em
  ui-button:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
spacing:
  unit: 4px
  gutter: 24px
  margin-edge: 64px
  asymmetric-offset: 12.5%
  section-gap: 160px
---

## Brand & Style

The design system is anchored in the visual language of high-fashion print media and avant-garde editorial design. It targets an elite audience that values curation, sophistication, and intellectual boldess. The aesthetic response should be one of "effortless luxury"—where the UI feels less like a software tool and more like a digital monograph.

The style is a fusion of **Minimalism** and **Modern Editorial**. It leverages heavy, intentional whitespace to create a sense of exclusivity, while utilizing **Asymmetric Balance** to move away from predictable, centered layouts. Thin, high-contrast dividers provide structural rigor without adding visual weight.

## Colors

The palette is strictly limited to emulate the materiality of physical publishing. 

- **Paper (#FDFCFB):** The primary background color. It is a warm, "off-white" that reduces digital eye strain and feels more tactile than pure white.
- **Ink (#0A0A0A):** Used for primary typography and structural lines. It provides the highest contrast against the Paper background.
- **Oxblood (#4A0E0E):** The solitary accent color. Used sparingly for interactive highlights, call-to-actions, or critical semantic moments. 
- **Neutral:** Mid-tone grays are used exclusively for secondary metadata and disabled states to ensure the hierarchy remains clear.

## Typography

Typography is the primary vehicle for the brand's personality. 

- **Display & Headlines:** Use **Bodoni Moda**. These should be oversized to create a dramatic, vertical rhythm. The high contrast between thick and thin strokes requires generous "leading" (line height) to remain legible at large scales.
- **Body Text:** Use **Hanken Grotesk**. A clean, contemporary sans-serif that provides a neutral counterpoint to the dramatic headlines. It ensures long-form content is highly readable.
- **Functional UI & Metadata:** Use **Space Mono**. This monospaced font is used for labels, timestamps, and technical data. It adds a layer of modern precision and "behind-the-scenes" editorial grit.

## Layout & Spacing

This design system utilizes an **asymmetric fluid grid** based on a 12-column foundation. 

- **Irregular Whitespace:** Avoid centering content. Key elements should be offset—for example, a headline might span the first 8 columns, while the supporting body text begins on column 5.
- **Vertical Rhythm:** Large gaps (up to 160px) should separate major sections to allow the eye to rest and emphasize the importance of the content.
- **Thin Dividers:** Use 1px 'Ink' lines to separate content vertically or horizontally. These lines should not always span the full width of the container; they can "stop short" to reinforce the asymmetric feel.
- **Mobile Adaptation:** On mobile, the asymmetry is simplified into a single-column stack, but "Paper" margins remain generous (minimum 24px) to maintain the premium feel.

## Elevation & Depth

In keeping with the editorial "print" aesthetic, depth is achieved through **Tonal Layering** and **Hard Overlaps** rather than shadows.

- **Flatness:** Avoid drop shadows entirely. The design system is strictly 2D. 
- **Z-Index Layering:** Hierarchy is established by overlapping elements. For example, an image might partially obscure a large display headline, or a floating UI panel might have a 1px solid border with no shadow, sitting directly on the Paper background.
- **Dividers:** Sharp, 1px lines are the only "architectural" elements used to define boundaries.

## Shapes

The shape language is **strictly geometric and sharp**. 

- **Corners:** All corners are 0px (sharp). This applies to buttons, input fields, cards, and images. 
- **Buttons:** Use rectangular frames with no roundedness. 
- **Visual Containers:** Images should be treated as bleed-to-edge or framed in sharp rectangular boxes. Any use of circles should be reserved exclusively for specific functional icons or user avatars to create a deliberate contrast.

## Components

- **Buttons:** Primary buttons are solid 'Ink' with 'Paper' text, all-caps. Secondary buttons are 'Paper' with a 1px 'Ink' border. Use the 'Oxblood' color for hover states or critical actions only.
- **Inputs:** Minimalist bottom-border only (1px Ink). Labels use 'Space Mono' in all-caps, positioned above the input field.
- **Cards:** Cards do not use background fills or shadows. They are defined by a top-border line (1px Ink) and ample bottom padding.
- **Lists:** High-contrast lists with significant vertical spacing. Each list item is separated by a 0.5px subtle divider.
- **Navigation:** A minimalist sidebar or top-bar using 'Space Mono' labels. The active state is indicated by a solid 'Oxblood' square or a simple strike-through.
- **Imagery:** Photography should be high-fashion or architectural in nature, using desaturated or high-contrast treatments to match the 'Ink' and 'Paper' palette.