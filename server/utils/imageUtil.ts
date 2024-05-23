import { MultipartFile } from "@fastify/multipart";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import jimp from "jimp";

export async function addTextWaterMark(text: string, file: MultipartFile) {
  const extension: string = file.filename.substring(
    file.filename.lastIndexOf(".") + 1,
  );

  const filename: string = randomBytes(86).toString("base64url");

  try {
    // file to buffer
    const buffer = await file.toBuffer();
    const image = await jimp.read(buffer);
    const font = await jimp.loadFont(jimp.FONT_SANS_32_WHITE);
    const font2 = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);

    // filename

    image.print(
      font,
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
    image.print(font2, 20, 20, {
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
