export type CommentaryTrigger =
  | 'playerCapture'
  | 'playerExtraTurn'
  | 'computerCapture'
  | 'computerExtraTurn'
  | 'computerWinning'
  | 'playerWinning'
  | 'closeGame'
  | 'gameStart'
  | 'computerWins'
  | 'playerWins'
  | 'playerNormalMove'
  | 'computerNormalMove';

export const commentaryPools: Record<CommentaryTrigger, string[]> = {
  playerCapture: [
    "Hey! Those were mine!",
    "Okay, nice grab...",
    "Did you just steal my stones?!",
    "Wow, rude! But also smart.",
    "I was saving those!",
    "Oof. That one stung.",
  ],
  playerExtraTurn: [
    "Extra turn?! No fair!",
    "Ugh, here we go again...",
    "Wait, you get to go AGAIN?",
    "Okay that was a slick move.",
    "I don't like where this is going.",
    "Show-off!",
  ],
  computerCapture: [
    "Yoink! Mine now!",
    "Ha! I'll take those!",
    "Scooped 'em! Too easy.",
    "Thank you very much!",
    "Don't mind if I do!",
    "Finders keepers!",
  ],
  computerExtraTurn: [
    "My turn again! Lucky me!",
    "Oh yeah, bonus round!",
    "I could do this all day!",
    "Encore! Encore!",
    "Two in a row, baby!",
    "Can't stop, won't stop!",
  ],
  computerWinning: [
    "I'm feeling pretty good!",
    "Better catch up!",
    "Things are looking great... for me.",
    "Is that all you've got?",
    "I'm on a roll!",
    "Cruising to victory!",
  ],
  playerWinning: [
    "Okay, you're actually good...",
    "I'm not worried... yet.",
    "Lucky streak, that's all!",
    "Alright, I need to focus.",
    "You're ahead FOR NOW.",
    "Time to get serious!",
  ],
  closeGame: [
    "This is so close!",
    "Anyone's game!",
    "I can't look!",
    "Nail-biter alert!",
    "Every stone counts now!",
    "Who's gonna pull ahead?!",
  ],
  gameStart: [
    "Let's do this!",
    "Ready to lose? Just kidding!",
    "May the best player win!",
    "Game on!",
    "Hope you brought your A-game!",
    "This is gonna be fun!",
  ],
  computerWins: [
    "GG! I win this time!",
    "Yes! Rematch?",
    "Victory dance time!",
    "That was a good game though!",
    "I earned that one!",
    "Winner winner! Good game!",
  ],
  playerWins: [
    "You got me! Well played!",
    "Okay, you're pretty good...",
    "Rematch? I want a rematch!",
    "Nice game! I'll get you next time.",
    "Well earned. Respect.",
    "You win THIS round...",
  ],
  playerNormalMove: [
    "Hmm, interesting...",
    "I see what you did there.",
    "Okay okay okay...",
    "Not bad, not bad.",
    "Huh. Bold choice.",
    "Let me think about this...",
  ],
  computerNormalMove: [
    "Watch and learn!",
    "Trust me on this one.",
    "All part of the plan.",
    "Calculated!",
    "Big brain move right here.",
    "Just you wait...",
  ],
};

export function getCommentary(
  trigger: CommentaryTrigger,
  rng: () => number = Math.random,
): string {
  const pool = commentaryPools[trigger];
  const index = Math.floor(rng() * pool.length);
  return pool[index];
}
