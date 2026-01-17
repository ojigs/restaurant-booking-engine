import { CategoryModel } from "@/models/CategoryModel";
import { SubcategoryModel } from "@/models/SubCategoryModel";
import { ItemModel } from "@/models/ItemModel";
import { PricingModel } from "@/models/PricingModel";
import { AvailabilityModel } from "@/models/AvailabilityModel";
import { BookingModel } from "@/models/BookingModel";
// import { AddonGroupModel } from "@/models/AddonGroupModel";

import { CategoryService } from "@/services/CategoryService";
import { ItemService } from "@/services/ItemService";
import { PricingService } from "@/services/PricingService";
import { BookingService } from "@/services/BookingService";

import { CategoryController } from "@/controllers/CategoryController";
import { ItemController } from "@/controllers/ItemController";
import { PricingController } from "@/controllers/PricingController";
import { BookingController } from "@/controllers/BookingController";

// models
const categoryModel = new CategoryModel();
const subcategoryModel = new SubcategoryModel();
const itemModel = new ItemModel();
const pricingModel = new PricingModel();
const availabilityModel = new AvailabilityModel();
const bookingModel = new BookingModel();
// const addonGroupModel = new AddonGroupModel();

// services
const pricingService = new PricingService(pricingModel, itemModel);
const categoryService = new CategoryService(
  categoryModel,
  subcategoryModel,
  itemModel
);
const itemService = new ItemService(
  itemModel,
  pricingModel,
  pricingService,
  availabilityModel
);
const bookingService = new BookingService(
  bookingModel,
  availabilityModel,
  itemModel,
  pricingService
);

// controllers
export const categoryController = new CategoryController(categoryService);
export const itemController = new ItemController(itemService);
export const pricingController = new PricingController(pricingService);
export const bookingController = new BookingController(bookingService);
