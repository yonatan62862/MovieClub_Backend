import { Request, Response } from "express";
import { Model } from "mongoose";
import { POST_POPULATE_FIELDS } from "../utils/constants";

class BaseController<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async getAll(req: Request, res: Response) {
    try {
      const posts = await this.model.find().populate(POST_POPULATE_FIELDS);
      res.status(200).send(posts);
    } catch (error) {
      console.log(error);
    }
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const post = await this.model.findById(id).populate({
        path: "owner",
        select: "firstName lastName",
      });
      // .populate({
      //   path: "likes",
      //   select: "firstName lastName",
      // })
      // .populate({
      //   path: "comments",
      //   populate: {
      //     path: "owner",
      //     select: "firstName lastName",
      //   },
      // });

      if (!post) {
        res.status(404).send({ message: "Post not found" });
        return;
      }

      res.status(200).send(post);
    } catch (error) {
      res.status(500).send({ message: "An error occurred", details: error });
    }
  }

  async create(req: Request, res: Response) {
    const body = req.body;
    try {
      const item = await this.model.create(body);
      res.status(201).send(item);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async deleteItem(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const deletedItem = await this.model.findByIdAndDelete(id);
      if (!deletedItem) {
        res.status(404).send({ message: "Item not found" });
        return;
      }
      res.status(200).send({ message: "Item deleted", item: deletedItem });
    } catch (error) {
      res.status(500).send({ message: "An error occurred", details: error });
    }
  }

  async getByOwner(req: Request, res: Response): Promise<Response> {
    const owner = req.query.owner;
    if (!owner) {
      return res
        .status(400)
        .send({ message: "Owner query parameter is required" });
    }

    try {
      const items = await this.model.find({ owner: owner.toString() });
      if (items.length === 0) {
        return res
          .status(404)
          .send({ message: "No items found for the specified owner" });
      }
      return res.status(200).send(items);
    } catch (error) {
      return res
        .status(500)
        .send({ message: "An error occurred", details: error });
    }
  }

  async updateItem(req: Request, res: Response) {
    const id = req.params.id;
    if (id) {
      try {
        const body = req.body;
        const update = await this.model.findByIdAndUpdate(id, body, {
          new: true,
        });
        res.status(200).send(update);
      } catch (error) {
        res.status(400).send(error);
      }
    }
  }
}

export default BaseController;
