type Vibe = 'happy' | 'sad' | 'disappointed' | 'funny'

export function generateRandomEmoji(vibe: Vibe) {
    const number = Math.random()

    switch (vibe) {
        case 'happy':
            return number < 0.33 ? '😄' : number < 0.67 ? '😃' : '😊'
        case 'sad':
            return number < 0.33 ? '😢' : number < 0.67 ? '😭' : '😟'
        case 'disappointed':
            return number < 0.33 ? '😤' : number < 0.67 ? '🙃' : '😐'
        case 'funny':
            return number < 0.33 ? '😂' : number < 0.67 ? '😆' : '🤣'
    }
}
