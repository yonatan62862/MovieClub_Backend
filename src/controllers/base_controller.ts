import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async getAll(req: Request, res: Response) {
    const ownerFilter = req.query.owner;
    try {
      if (ownerFilter) {
        const posts = await this.model.find({ owner: ownerFilter });
        res.status(200).send(posts);
      } else {
        const posts = await this.model.find();
        res.status(200).send(posts);
      }
    } catch (error) {
      res.status(500).send({ message: "An error occurred", details: error });
    }
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const item = await this.model.findById(id);
      if (!item) {
        res.status(404).send({ message: "Item not found" });
        return;
      }
      res.status(200).send(item);
    } catch (error) {
      res.status(500).send({ message: "An error occurred", details: error });
    }
  }

  async create(req: Request, res: Response) {
    const item = req.body;
    try {
      const newItem = await this.model.create(item);
      res.status(201).send(newItem);
    } catch (error) {
      res.status(400).send({ message: "Failed to create item", details: error });
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

  async getByOwner(req: Request, res: Response) {
    const owner = req.query.owner;
    if (!owner) {
      res.status(400).send({ message: "Owner query parameter is required" });
      return;
    }
    try {
      const items = await this.model.find({ owner });
      res.status(200).send(items);
    } catch (error) {
      res.status(500).send({ message: "An error occurred", details: error });
    }
  }

  async updateItem(req: Request, res: Response) {
    const id = req.params.id;
    const updateData = req.body;
    try {
      const updatedItem = await this.model.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedItem) {
        res.status(404).send({ message: "Item not found" });
        return;
      }
      res.status(200).send(updatedItem);
    } catch (error) {
      res.status(500).send({ message: "An error occurred", details: error });
    }
  }
}

export default BaseController;
