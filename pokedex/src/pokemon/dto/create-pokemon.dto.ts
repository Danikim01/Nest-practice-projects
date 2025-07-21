import {IsInt, IsString, Max, Min, MinLength, MaxLength} from 'class-validator';

export class CreatePokemonDto {
    @IsInt()
    @Min(1)
    @Max(905)
    no: number;

    @IsString()
    @MinLength(1)
    @MaxLength(20)
    name: string;
}
