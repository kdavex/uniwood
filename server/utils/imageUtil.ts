import { MultipartFile } from "@fastify/multipart";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import jimp from "jimp";
import { Font } from "@jimp/plugin-print";

export async function addTextWaterMark(text: string, file: MultipartFile) {
  const extension: string = file.filename.substring(
    file.filename.lastIndexOf(".") + 1,
  );

  const filename: string = randomBytes(86).toString("base64url");

  try {
    // file to buffer
    const buffer = await file.toBuffer();
    const image = await jimp.read(buffer);

    const imageWidth = image.getWidth();
    const imageHeight = image.getHeight();
    let fontBlack: Font;
    let fontWhite: Font;

    if (imageWidth > 1000) {
      fontBlack = await jimp.loadFont(jimp.FONT_SANS_64_BLACK);
      fontWhite = await jimp.loadFont(jimp.FONT_SANS_64_WHITE);
    } else if (imageWidth > 500) {
      fontBlack = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
      fontWhite = await jimp.loadFont(jimp.FONT_SANS_32_WHITE);
    } else {
      fontBlack = await jimp.loadFont(jimp.FONT_SANS_12_BLACK);
      fontWhite = await jimp.loadFont(jimp.FONT_SANS_16_WHITE);
    }

    // filename

    image.print(
      fontBlack,
      -20,
      -20,
      {
        text: `@${text}`,
        alignmentX: jimp.HORIZONTAL_ALIGN_RIGHT,
        alignmentY: jimp.VERTICAL_ALIGN_BOTTOM,
      },
      image.getWidth(),
      image.getHeight(),
    );
    image.print(fontWhite, 20, 20, {
      text: `@${text}`,
      alignmentX: jimp.HORIZONTAL_ALIGN_LEFT,
      alignmentY: jimp.VERTICAL_ALIGN_TOP,
    });
    image.write(resolve(__dirname, `../tmp/${filename}.${extension}`));
  } catch (error) {
    console.log(error);
  }

  return `${filename}.${extension}`;
}
