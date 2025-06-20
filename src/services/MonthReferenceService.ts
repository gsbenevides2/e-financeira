import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { monthReferences } from "../db/schema";
import type { CreateMonthReferenceDto, MonthReference, UpdateMonthReferenceDto, UUID } from "../types";

export class MonthReferenceService {
  static async create(dto: CreateMonthReferenceDto): Promise<MonthReference> {
    const [monthReference] = await db
      .insert(monthReferences)
      .values({
        month: dto.month,
        year: dto.year,
      })
      .returning();

    return {
      id: monthReference.id,
      month: monthReference.month,
      year: monthReference.year,
      createdAt: monthReference.createdAt,
      updatedAt: monthReference.updatedAt,
    };
  }

  static async update(dto: UpdateMonthReferenceDto): Promise<MonthReference | undefined> {
    const [monthReference] = await db
      .update(monthReferences)
      .set({
        month: dto.month,
        year: dto.year,
        updatedAt: new Date(),
      })
      .where(eq(monthReferences.id, dto.id))
      .returning();

    if (!monthReference) return undefined;

    return {
      id: monthReference.id,
      month: monthReference.month,
      year: monthReference.year,
      createdAt: monthReference.createdAt,
      updatedAt: monthReference.updatedAt,
    };
  }

  static async delete(id: UUID): Promise<boolean> {
    const [monthReference] = await db.delete(monthReferences).where(eq(monthReferences.id, id)).returning();

    return !!monthReference;
  }

  static async getById(id: UUID): Promise<MonthReference | undefined> {
    const [monthReference] = await db.select().from(monthReferences).where(eq(monthReferences.id, id));

    if (!monthReference) return undefined;

    return {
      id: monthReference.id,
      month: monthReference.month,
      year: monthReference.year,
      createdAt: monthReference.createdAt,
      updatedAt: monthReference.updatedAt,
    };
  }

  static async getAll(): Promise<MonthReference[]> {
    const monthReferencesList = await db.select().from(monthReferences).orderBy(monthReferences.year, monthReferences.month);

    return monthReferencesList.map((mr) => ({
      id: mr.id,
      month: mr.month,
      year: mr.year,
      createdAt: mr.createdAt,
      updatedAt: mr.updatedAt,
    }));
  }

  static async findOrCreate(month: number, year: number): Promise<MonthReference> {
    const [existingMonthReference] = await db
      .select()
      .from(monthReferences)
      .where(and(eq(monthReferences.month, month), eq(monthReferences.year, year)));

    if (existingMonthReference) {
      return {
        id: existingMonthReference.id,
        month: existingMonthReference.month,
        year: existingMonthReference.year,
        createdAt: existingMonthReference.createdAt,
        updatedAt: existingMonthReference.updatedAt,
      };
    }

    return this.create({ month, year });
  }
}
