import { Request, Response } from "express";

// export default class RatingRepository {
//   static getAllRatingOfProduct = async (req: Request) => {
//     const { dataSource } = req.app.locals;
//     const { idProduct } = req.params;
//     const {
//       pageSize,
//       pageIndex,
//       sortBy = "value",
//       orderBy = "DESC",
//     } = req.query;

//     const productRepository = dataSource.getRepository(Product);
//     const ratingRepository = dataSource.getRepository(Rating);

//     const product = await productRepository.findOneBy({ id: idProduct });
//     if (!product) {
//       throw new NotFoundError("Product not found.");
//     }
//     let criteria: FindManyOptions<Rating> = {
//       relations: {
//         user: true,
//       },
//       skip:
//         pageSize && pageIndex
//           ? Number(pageSize) * (Number(pageIndex) - 1)
//           : undefined,
//       take: pageSize && pageIndex ? Number(pageSize) : undefined,
//       select: {
//         id: true,
//         value: true,
//         comment: true,
//         createdAt: true,
//         createdBy: true,
//         user: {
//           id: true,
//           username: true,
//           avatar: true,
//         },
//       },
//       where: {
//         product: {
//           id: idProduct,
//         },
//       },
//     };

//     if (sortBy) {
//       criteria = {
//         ...criteria,
//         order: {
//           [sortBy as string]: orderBy,
//         },
//       };
//     }

//     const [ratings, count] = await ratingRepository.findAndCount(criteria);

//     return {
//       pageSize: pageIndex && pageSize ? Number(pageSize) : null,
//       pageIndex: pageIndex && pageSize ? Number(pageIndex) : null,
//       count,
//       totalPages: pageSize ? Math.ceil(count / Number(pageSize)) : 1,
//       ratings,
//     };
//   };
//   static getSummaryRatingOfProduct = async (req: Request) => {
//     const { dataSource } = req.app.locals;
//     const { idProduct } = req.params;

//     const productRepository = dataSource.getRepository(Product);
//     const ratingRepository = dataSource.getRepository(Rating);

//     const product = await productRepository.findOneBy({ id: idProduct });
//     if (!product) {
//       throw new NotFoundError("Product not found.");
//     }

//     const [oneStar, twoStar, threeStar, fourStar, fiveStar] = await Promise.all(
//       [
//         ratingRepository.count({
//           where: {
//             product: {
//               id: idProduct,
//             },
//             value: 1,
//           },
//         }),
//         ratingRepository.count({
//           where: {
//             product: {
//               id: idProduct,
//             },
//             value: 2,
//           },
//         }),
//         ratingRepository.count({
//           where: {
//             product: {
//               id: idProduct,
//             },
//             value: 3,
//           },
//         }),
//         ratingRepository.count({
//           where: {
//             product: {
//               id: idProduct,
//             },
//             value: 4,
//           },
//         }),
//         ratingRepository.count({
//           where: {
//             product: {
//               id: idProduct,
//             },
//             value: 5,
//           },
//         }),
//       ]
//     );

//     return {
//       oneStar,
//       twoStar,
//       threeStar,
//       fourStar,
//       fiveStar,
//       total: oneStar + twoStar + threeStar + fourStar + fiveStar,
//       average: product.rate,
//     };
//   };

//   static add = async ({ req, res }: { req: Request; res: Response }) => {
//     const { shopId, productId, value, comment } = req.body;

//     const { dataSource } = req.app.locals;
//     const { session } = res.locals;
//     const productRepository = dataSource.getRepository(Product);
//     const shopRepository = dataSource.getRepository(Shop);
//     const ratingRepository = dataSource.getRepository(Rating);
//     const shop = await shopRepository.findOneBy({ id: shopId });
//     if (!shop) {
//       throw new NotFoundError("Shop not found.");
//     }
//     const product = await productRepository.findOneBy({ id: productId });
//     if (!product) {
//       throw new NotFoundError("Product not found.");
//     }

//     const rating = ratingRepository.create({
//       createdBy: session.userId,
//       value,
//       comment,
//       product,
//       shop,
//       user: session.userId,
//     });

//     product.rate = (product.rate + value) / 2;

//     await Promise.all([
//       productRepository.save(product),
//       ratingRepository.save(rating),
//     ]);
//     return rating;
//   };
// }
export default class RatingRepository {
  static getAllRatingOfProduct = async (req: Request) => {};
  static getSummaryRatingOfProduct = async (req: Request) => {};

  static add = async ({ req, res }: { req: Request; res: Response }) => {};
}
