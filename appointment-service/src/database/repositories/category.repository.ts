import { Request, Response } from "express";

// export default class ProductCategoryRepository {
//   static getAllCategories = async (req: Request) => {
//     const { dataSource } = req.app.locals;

//     const { pageSize = 100, pageIndex = 1, searchName } = req.query;

//     const productCategoryRepository = dataSource.getRepository(ProductCategory);

//     const productCategories = await productCategoryRepository.find({
//       skip: Number(pageSize) * (Number(pageIndex) - 1),
//       take: Number(pageSize),
//       where: {
//         name: searchName ? ILike(`%${searchName}%`) : undefined,
//       },
//     });

//     const count = await productCategoryRepository.count({
//       where: {
//         name: searchName ? ILike(`%${searchName}%`) : undefined,
//       },
//     });

//     return {
//       pageSize: Number(pageSize),
//       pageIndex: Number(pageIndex),
//       count,
//       totalPages: Math.ceil(count / Number(pageSize)),
//       productCategories: productCategories.map((category: ProductCategory) => {
//         const { ...restProductCategory } = category;
//         return restProductCategory;
//       }),
//     };
//   };

//   static getProductCategoryById = async (req: Request) => {
//     const { id } = req.params;
//     const { dataSource } = req.app.locals;
//     const productCategoryRepository = dataSource.getRepository(ProductCategory);

//     const productCategory = await productCategoryRepository.findOne({
//       where: { id },
//       relations: ["products"],
//     });

//     if (!productCategory) {
//       throw new NotFoundError("Category is not found.");
//     }
//     return {
//       productCategory,
//     };
//   };

//   static add = async ({ req, res }: { req: Request; res: Response }) => {
//     const { name, image, description } = req.body;

//     const { dataSource } = req.app.locals;
//     const { session } = res.locals;
//     const productCategoryRepository = dataSource.getRepository(ProductCategory);

//     const productCategory = productCategoryRepository.create({
//       name,
//       image,
//       description,
//       createdBy: session.userId,
//     });

//     await productCategoryRepository.save(productCategory);

//     return {
//       productCategory: {
//         ...productCategory,
//       },
//     };
//   };

//   static update = async ({ req, res }: { req: Request; res: Response }) => {
//     const { id } = req.params;
//     const { name, image, description } = req.body;

//     const { dataSource } = req.app.locals;
//     const productCategoryRepository = dataSource.getRepository(ProductCategory);

//     const productCategory = await productCategoryRepository.findOne({
//       where: { id },
//       relations: ["products"],
//     });

//     if (!productCategory) {
//       throw new NotFoundError("Product category not found.");
//     }

//     productCategory.name = name ?? productCategory.name;
//     productCategory.image = image ?? productCategory.image;
//     productCategory.description = description ?? productCategory.description;

//     await productCategoryRepository.save(productCategory);

//     return {
//       productCategory: {
//         ...productCategory,
//         products: productCategory.products,
//       },
//     };
//   };

//   static softDelete = async (req: Request, res: Response) => {
//     const { id } = req.params;

//     const { dataSource } = req.app.locals;
//     const productCategoryRepository = dataSource.getRepository(ProductCategory);

//     const productCategory = await productCategoryRepository.findOne({
//       where: { id },
//     });

//     if (!productCategory) {
//       throw new NotFoundError("Product category not found.");
//     }

//     if (productCategory.createdBy === "migration") {
//       throw new ForbiddenError("Cannot delete this product category.");
//     }

//     await productCategoryRepository.softDelete({ id });

//     return {
//       message: "Product category successfully soft deleted.",
//     };
//   };
//   static hardDelete = async (req: Request, res: Response) => {
//     const { id } = req.params;

//     const { dataSource } = req.app.locals;
//     const productCategoryRepository = dataSource.getRepository(ProductCategory);

//     const productCategory = await productCategoryRepository.findOne({
//       where: { id },
//       relations: ["products"],
//     });

//     if (!productCategory) {
//       throw new NotFoundError("Product category not found.");
//     }

//     if (productCategory.createdBy === "migration") {
//       throw new ForbiddenError("Cannot delete this product category.");
//     }

//     await productCategoryRepository.remove(productCategory);

//     return {
//       message: "Product category successfully hard deleted.",
//     };
//   };
// }
export default class ProductCategoryRepository {
  static getAllCategories = async (req: Request) => {};

  static getProductCategoryById = async (req: Request) => {};

  static add = async ({ req, res }: { req: Request; res: Response }) => {};

  static update = async ({ req, res }: { req: Request; res: Response }) => {};

  static softDelete = async (req: Request, res: Response) => {};
  static hardDelete = async (req: Request, res: Response) => {};
}
