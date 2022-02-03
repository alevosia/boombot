type Energy = 'happy' | 'sad' | 'angry' | 'neutral' | 'funny'

export function generateRandomEmoji(energy: Energy) {
    const number = Math.random()

    switch (energy) {
        case 'happy':
            return number < 0.33 ? '😄' : number < 0.67 ? '😃' : '😊'
        case 'sad':
            return number < 0.33 ? '😢' : number < 0.67 ? '😭' : '😟'
        case 'angry':
            return number < 0.33 ? '🙃' : number < 0.67 ? '😠' : '😤'
        case 'neutral':
            return number < 0.33 ? '🥴' : number < 0.67 ? '😏' : '😐'
        case 'funny':
            return number < 0.33 ? '😂' : number < 0.67 ? '😃' : '🤣'
    }
}
