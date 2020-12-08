// Fui obrigado a fazer o meu proprio codigo de paginate porque simplesmente todas as bibliotecas que
// ja existem estao demorando absurdos 18 segundos para fazer uma query que nao deveria demorar isso tudo
// por algum motivo

import { FilterQuery } from "mongoose";
import { Model } from "mongoose";

interface PaginateOptions {
  page?: number | string;
  limit?: number | string;
  estimatedDocumentCount?: boolean;
}

interface PaginateResult {
  docs: any[];
  totalDocs: number;
  limit: number | string;
  page: number | string;
  totalPages: number;
  pagingCounter: number;
  hasPrev: boolean;
  hasNext: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export const paginate = async (
  Model: Model<any>,
  query: FilterQuery<any>,
  sort: Object[] | string[] | undefined,
  { page = 1, limit = 10, estimatedDocumentCount = true }: PaginateOptions
): Promise<PaginateResult> => {
  // Inicializando os valores opcionais caso nao tenham sido fornecidos
  query = query || {};
  limit = typeof limit === "string" ? Number(limit) : limit;
  page = typeof page === "string" ? Number(page) : page;
  const offset = limit;

  const paginationResult = {} as PaginateResult;

  // if sort parameter is not falsy then
  if (sort) {
    let findQuery = Model.find(query)
      .limit(limit)
      .skip((page - 1) * offset)
      .lean(true);
    for (const sortObj of sort) {
      findQuery.sort(sortObj);
    }
    // console.time("tempo para buscar documentos");
    paginationResult.docs = await findQuery.exec();
    // console.timeEnd("tempo para buscar documentos");
  } else {
    paginationResult.docs = await Model.find(query)
      .limit(limit)
      .skip((page - 1) * offset)
      .lean(true)
      .exec();
  }

  if (estimatedDocumentCount) {
    // console.time("tempo para contar quantos dumentos na busca");
    paginationResult.totalDocs = await Model.estimatedDocumentCount(query);
    // console.timeEnd("tempo para contar quantos dumentos na busca");
  } else {
    paginationResult.totalDocs = await Model.countDocuments(query);
  }
  paginationResult.limit = limit;
  paginationResult.totalPages = Math.ceil(paginationResult.totalDocs / limit);
  paginationResult.page = page;
  paginationResult.pagingCounter = (page - 1) * offset + 1;

  // If it's the FIRST page then it does not have a previous page
  if (page === 1) {
    paginationResult.hasPrev = false;
    paginationResult.prevPage = null;
    // Otherwise it has a previous page
  } else {
    paginationResult.hasPrev = true;
    paginationResult.prevPage = page - 1;
  }

  // If it's the LAST page then it does not have a next page
  if (page === paginationResult.totalPages) {
    paginationResult.hasNext = false;
    paginationResult.nextPage = null;
    // Otherwise it has a next page
  } else {
    paginationResult.hasNext = true;
    paginationResult.nextPage = page + 1;
  }

  return paginationResult;
};
