// backend/src/places/places.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PlacesService } from './places.service';
import { GetPlacesQueryDto } from './dto/get-places-query.dto';
 
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}
 
  @Get()
  findAll(@Query() query: GetPlacesQueryDto) {
    return this.placesService.findAll(query);
  }
 
  @Get('categories')
  getCategories() {
    return this.placesService.getCategories();
  }
}