import { NextFunction, Request, Response } from "express";

export async function get(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  // вывод информации о выбранном файле

  res.status(200).json({ success: true, message: { file: {} } });
}

export async function getList(req: Request, res: Response, next: NextFunction) {
  const { list_size = 10, page = 1 } = req.params;

  // выводит список файлов и их параметров из базы с
  // использованием пагинации с размером страницы, указанного в
  // передаваемом параметре list_size, по умолчанию 10 записей на страницу,
  // если параметр пустой. Номер страницы указан в параметре page, по
  // умолчанию 1, если не задан

  res.status(200).json({ success: true, message: { files: {} } });
}

export async function update(req: Request, res: Response, next: NextFunction) {
  // обновление текущего документа на новый в базе и
  // локальном хранилище

  res.status(200).json({ success: true, message: { files: {} } });
}

export async function upload(req: Request, res: Response, next: NextFunction) {
  // добавление нового файла в систему и запись
  // параметров файла в базу: название, расширение, MIME type, размер, дата
  // Загрузки;

  res.status(204);
}

export async function download(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // скачивание конкретного файла

  res.status(200);
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  // удаляет документ из базы и локального
  // Хранилища

  res.status(204);
}
