# Editor continuous painting

Default drag mode paints cells under a captured pointer, with integer line interpolation between samples to prevent skipped cells. One gesture records one undo snapshot and visits each cell once. Pointer cancel/lost capture/blur ends the stroke; the synthesized click is suppressed. Grid cells carry explicit row/lane metadata; bottom-to-top numbering is unchanged. Secondary pointers do not join a stroke.

The drag toggle changes to scroll mode and permits vertical scrolling across the grid. Single-cell click and keyboard activation remain available. Page fill applies the currently selected brush/color to all7 lanes of only the current16-row page, including a shorter final page. It records one undo snapshot and leaves other pages unchanged. No automatic save; use existing save/apply.

Tested pointer path interpolation, color, gesture undo, cancellation, scroll mode, partial final-page isolation21cells and undo, existing editor/backup/background flows, boot and21-course progression. Physical mobile pointer capture/scroll UX remains for device verification. Closed-beta access is preserved.
