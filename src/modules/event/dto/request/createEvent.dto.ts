import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsMilitaryTime, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { ObjectId } from "mongodb";
import { ConsumableDto } from "../../../consumable/dto/consumable.dto";
import { EventExpensesSummaryDto } from "../../../expense/dto/eventExpensesSummary.dto";
import { ExpenseDto } from "../../../expense/dto/expense.dto";
import { AddressDto } from "../address.dto";
import { StateHistoryDto } from "../stateHistory.dto";
import { TemplateDto } from "../template.dto";
import { TypeEventDto } from "../typeEvent.dto";

export class CreateEventDTO{
    @ApiProperty({
        example: 'Casamiento Cami y Kako',
        required: true,
        description: 'Es el nombre del evento que se llevará a cabo.'
    })
    @IsNotEmpty({
        message: '$property#El título no puede estar vacío.'
    })
    @IsString({
        message: '$property#El titulo del evento no es válido.'
    })
    @MaxLength(50, {
        message: '$property#El título debe ser menor a 50 caracteres.'
    })
    public title: string;

    @ApiProperty({
        example: '2023-09-15',
        required: true,
        description: 'Es la fecha en la cual iniciará el evento.'
    })
    @IsNotEmpty({
        message: '$property#La fecha de inicio no puede estar vacía.'
    })
    @IsDateString({},{
        message: '$property#La fecha de inicio no tiene el formato correcto.'
    })
    //validar que la fecha sea mayor a la actual.
    public start_date: string;

    @ApiProperty({
        example: '19:00',
        required: true,
        description: 'Es la hora en la cual iniciará el evento.'
    })
    @IsNotEmpty({
        message: '$property#La hora de inicio no puede estar vacía.'
    })
    @IsMilitaryTime({
        message: '$property#La hora de inicio no posee el formato válido.'
    })
    public start_time: string;

    @ApiProperty({
        example: '2023-09-16',
        required: false,
        description: 'Es la fecha en la cual finalizará el evento.'
    })
    @IsOptional()
    @IsDateString({},{
        message: '$property#La fecha de fin no tiene el formato correcto.'
    })
    public end_date?: string;

    @ApiProperty({
        example: '05:00',
        required: false,
        description: 'Es la hora en la cual finalizará el evento.'
    })
    @IsOptional()
    @IsMilitaryTime({
        message: '$property#La hora de fin no posee el formato válido.'
    })
    public end_time?: string;

    @ApiProperty({
        example: 'Fiesta de casamiento de Camila Bermejo y Joaquin Costamagna.',
        required: false,
        description: 'Es la descripción del evento que se llevará a cabo.'
    })
    @IsOptional()
    @IsString({
        message: '$property#La descripción del evento no es válida.'
    })
    @MaxLength(500,{
        message: '$property#La descripción debe ser menor a 500 caracteres.'
    })
    public description?: string;

    @ApiProperty({
        example: {alias: 'Bolgheri', street: 'San Martin', number: 3645, city: 'Villa Allende'},
        required: false,
        description: 'Es la dirección donde se llevará a cabo el evento.'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    public address?: AddressDto;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: false,
        description: 'Es el user_id del creador del evento.'
    })
    @IsOptional()
    public creator?: ObjectId; //user_id

    @ApiProperty({
        example: {name: 'Casamiento',is_private: true, description: 'Fiesta de casamiento privada para más de 300 personas.'},
        required: true,
        description: 'Es el tipo de evento que se llevara a cabo.'
    })
    @IsNotEmpty({
        message: '$property#El tipo de evento no puede estar vacío.'
    })
    @ValidateNested()
    @Type(() => TypeEventDto)
    public type: TypeEventDto;

    @ApiProperty({
        example: [{name: 'Choripan', description: 'Pan, Chorizo, Salsa criolla, Chimi y Mayonesa', subscribers: [{user_id: "ObjectId('6317c1a96c3c794b8d3663ed')", quantity: 2}, {user_id: "ObjectId('15647c1a96c3c794b8d3663ed')", quantity: 3}]}],
        required: false,
        description: 'Son los consumbiles disponibles en el evento.'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ConsumableDto)
    public consumables?: ConsumableDto[];

    @ApiProperty({
        example: [{name: 'Choripan', description: 'Pan, Chorizo, Salsa criolla, Chimi y Mayonesa', amount: 2500, quantifiable: true, in_charge: "ObjectId('6317c1a96c3c794b8d3663ed')", subscribers: [{user_id: "ObjectId('6317c1a96c3c794b8d3663ed')", quantity: 2}, {user_id: "ObjectId('15647c1a96c3c794b8d3663ed')", quantity: 3}]}],
        required: false,
        description: 'Son los gastos del evento.'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ExpenseDto)
    public expenses?: ExpenseDto[];

    @ApiProperty({
        example: 'created',
        required: true,
        description: 'Es el estado actual del evento.'
    })
    public state: string;

    @ApiProperty({
        example: [{name: 'created', start_date: '2023-09-15 19:00:00', end_date: '2023-09-15 20:00:00'}, {name: 'ongoing', start_date: '2023-09-15 21:00:00'}],
        required: false,
        description: 'Es el historial de estados del evento.'
    })
    public state_history?: StateHistoryDto[];

    public expensesSummary: EventExpensesSummaryDto;

    @ApiProperty({
        required: false,
        description: 'El template de un evento.'
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => TemplateDto)
    public template?: TemplateDto;

    public CREATOR_PERMI;
    public ORGANIZER_PERMI;
    public GUEST_PERMI;
    public SERVICE_PERMI;
    public PUBLIC_GUEST_PERMI;
}