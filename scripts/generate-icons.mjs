import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const input = join(root, 'logo.png')
const outputDir = join(root, 'public/icons')
const sizes = [16, 32, 48, 128]

const sourceMeta = await sharp(input).metadata()
console.log(
  `Source: ${sourceMeta.width}x${sourceMeta.height}, channels=${sourceMeta.channels}, hasAlpha=${sourceMeta.hasAlpha}`,
)

await mkdir(outputDir, { recursive: true })

for (const size of sizes) {
  const output = join(outputDir, `icon${size}.png`)
  await sharp(input)
    .ensureAlpha()
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(output)

  const { hasAlpha, channels } = await sharp(output).metadata()
  console.log(`Wrote ${output} (${channels} channels, alpha: ${hasAlpha})`)
}
