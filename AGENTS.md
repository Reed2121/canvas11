<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the uploaded canvas game in `public/game.html` with the React shell handling accounts and ranked reporting; base-game updates must merge rather than replace the online bridge.
- Only the peer host simulates online gameplay, including terrain events; snapshots carry mutable terrain and fighter-referenced effects so guests render the same match.
