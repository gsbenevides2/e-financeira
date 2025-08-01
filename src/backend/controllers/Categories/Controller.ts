import { Elysia, t } from "elysia";
import { TransactionCategoryService } from "../../services/TransactionCategoryService";
import * as CategorySchemas from "./Schemas";

const CategoryController = new Elysia({
  prefix: "/categories",
  detail: {
    tags: ["Categories"],
  },
})
  .get(
    "/",
    async () => {
      const categories = await TransactionCategoryService.getAll();
      return categories;
    },
    {
      response: {
        200: t.Array(CategorySchemas.categoryResponseSchema),
      },
      detail: {
        description: "Get all categories",
      },
    }
  )
  .post(
    "/",
    async ({ body }) => {
      const category = await TransactionCategoryService.create(body);
      return category;
    },
    {
      body: CategorySchemas.categoryCreateSchema,
      response: {
        201: CategorySchemas.categoryResponseSchema,
      },
      detail: {
        description: "Create a new category",
      },
    }
  )
  .get(
    "/:id",
    async ({ params, status }) => {
      const category = await TransactionCategoryService.getById(params.id);
      if (!category) {
        return status(404, {
          error: "Category not found",
        });
      }
      return category;
    },
    {
      response: {
        200: CategorySchemas.categoryResponseSchema,
        404: CategorySchemas.errorResponseSchema,
      },
      detail: {
        description: "Get a category by id",
      },
    }
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const category = await TransactionCategoryService.update({
        id: params.id,
        ...body,
      });
      return category;
    },
    {
      params: CategorySchemas.categoryIdSchema,
      body: CategorySchemas.categoryCreateSchema,
      response: {
        200: CategorySchemas.categoryResponseSchema,
      },
      detail: {
        description: "Update a category by id",
      },
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await TransactionCategoryService.delete(params.id);
      return {
        success: true,
      };
    },
    {
      params: CategorySchemas.categoryIdSchema,
      response: {
        200: CategorySchemas.successResponseSchema,
        404: CategorySchemas.errorResponseSchema,
      },
      detail: {
        description: "Delete a category by id",
      },
    }
  );

export default CategoryController;
