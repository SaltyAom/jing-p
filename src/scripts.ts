const id = <T extends HTMLElement = HTMLElement>(id: string) =>
    document.getElementById(id) as T

const on = <Event extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    event: Event,
    callback: (this: HTMLElement, ev: HTMLElementEventMap[Event]) => unknown
) => element.addEventListener(event, callback)

const factory = (context: CanvasRenderingContext2D) => {
    const imageCaches: Record<string, HTMLImageElement> = {}

    const draw = (
        src: string,
        {
            x = 0,
            y = 0,
            scale = 1,
            name
        }: {
            x?: number
            y?: number
            scale?: number
            name?: string
        } = {}
    ) =>
        new Promise<void>((resolve, reject) => {
            const cached = imageCaches[name || src]

            if (cached)
                return resolve(
                    context.drawImage(
                        cached,
                        x,
                        y,
                        cached.width * scale,
                        cached.height * scale
                    )
                )

            const image = new Image()
            image.src = src

            image.onload = () => {
                context.drawImage(
                    image,
                    x,
                    y,
                    image.width * scale,
                    image.height * scale
                )

                imageCaches[name || src] = image

                resolve()
            }

            image.onerror = reject
        })

    const text = (
        word: string,
        {
            x = 0,
            y = 0,
            size = 128,
            color = 'white'
        }: {
            x?: number
            y?: number
            size?: number
            color?: string
        } = {}
    ) => {
        context.font = `${size}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`
        context.fillStyle = color
        context.textAlign = 'center'

        context.fillText(word, x, y, 650)
    }

    const reset = () => {
        context.canvas.width = 1920
        context.canvas.height = 1080

        context.fillStyle = '#fae54d'
        context.fillRect(0, 0, 1920, 1080)
    }

    const addBalloon = () =>
        draw('/balloon.png', {
            x: 900,
            y: 50,
            scale: 1.9
        })

    return {
        draw,
        text,
        reset,
        addBalloon
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = id('form')!
    const fileContainer = id<HTMLInputElement>('file')

    const canvas = id<HTMLCanvasElement>('jing-p')!
    const context = canvas.getContext('2d')!
    const { reset, addBalloon, draw, text } = factory(context)

    let title = 'จริงพี่'
    let caption = 'พี่ว่าไงผมก็ว่างั้น'
    let image: string | File | undefined = '/tia.jpg'
    let x = 0
    let y = 0
    let scale = 1.675
    let imageCached = Date.now().toString()

    const write = () => {
        if (caption) {
            text(title, {
                size: 192,
                x: 1430,
                y: 400
            })

            text(caption, {
                size: 72,
                x: 1430,
                y: 550
            })
        } else {
            text(title, {
                size: 192,
                x: 1430,
                y: 440
            })
        }
    }

    const update = async () => {
        reset()

        if (image)
            await draw(
                typeof image !== 'string' ? URL.createObjectURL(image) : image,
                {
                    x,
                    y,
                    scale,
                    name: imageCached
                }
            )

        await addBalloon()
        write()
    }

    update()

    on(id<HTMLInputElement>('title'), 'input', (event) => {
        title = (event.target as HTMLInputElement).value!

        update()
    })

    on(id('caption'), 'input', (event) => {
        caption = (event.target as HTMLInputElement).value!

        update()
    })

    on(id('x'), 'input', (event) => {
        x = +(event.target as HTMLInputElement).value!

        update()
    })

    on(id('y'), 'input', (event) => {
        y = +(event.target as HTMLInputElement).value!

        update()
    })

    on(id('scale'), 'input', (event) => {
        scale = +(event.target as HTMLInputElement).value!

        update()
    })

    on(fileContainer, 'change', (event) => {
        const { files } = event.target as HTMLInputElement
        const file = files?.[0]

        if (!file) return

        image = file
        imageCached = Date.now().toString()

        update()
    })

    on(form, 'submit', (event) => {
        event.preventDefault()

        const a = document.createElement('a')
        a.href = canvas.toDataURL('image/jpeg', 1.0)
        a.download = `${title}.jpg`
        a.click()
    })
})
