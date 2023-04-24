import { ApiProperty } from "@nestjs/swagger";
import { ActivityDto } from "../../activity/dto/activity.dto";
import { AddressDto } from "./address.dto";
import { GuestXEventDto } from "../../guest/dto/guestXEvent.dto";
import { TypeEventDto } from "./typeEvent.dto";
import { ObjectId } from "mongodb";
import { OrganizerDto } from "./organizer.dto";
import { ConsumableDto } from "../../consumable/dto/consumable.dto";
import { ExpenseDto } from "../../expense/dto/expense.dto";
import { EventExpensesSummaryDto } from "../../expense/dto/eventExpensesSummary.dto";
import { StateHistoryDto } from "./stateHistory.dto";
import { TemplateDto } from "./template.dto";
import { TransportDto } from "../../../modules/transport/dto/transport.dto";
import { PollDto } from "../../../modules/poll/dto/poll.dto";

export class EventDto{
    public _id?: ObjectId;

    @ApiProperty({
        example: 'Casamiento Cami y Kako',
        required: true,
        description: 'Es el nombre del evento que se llevará a cabo.'
    })
    public title: string;

    @ApiProperty({
        example: '2023-09-15',
        required: true,
        description: 'Es la fecha en la cual iniciará el evento.'
    })
    public start_date: string;

    @ApiProperty({
        example: '19:00',
        required: true,
        description: 'Es la hora en la cual iniciará el evento.'
    })
    public start_time: string;

    @ApiProperty({
        example: '2023-09-16',
        required: false,
        description: 'Es la fecha en la cual finalizará el evento.'
    })
    public end_date?: string;

    @ApiProperty({
        example: '05:00',
        required: false,
        description: 'Es la hora en la cual finalizará el evento.'
    })
    public end_time?: string;
    
    @ApiProperty({
        example: 'Fiesta de casamiento de Camila Bermejo y Joaquin Costamagna.',
        required: false,
        description: 'Es la descripción del evento que se llevará a cabo.'
    })
    public description?: string;

    @ApiProperty({
        example: {alias: 'Bolgheri', street: 'San Martin', number: 3645, city: 'Villa Allende'},
        required: false,
        description: 'Es la dirección donde se llevará a cabo el evento.'
    })
    public address?: AddressDto;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: true,
        description: 'Es el user_id del creador del evento.'
    })
    public creator: ObjectId; //user_id

    @ApiProperty({
        example: [{user_id: "ObjectId(6317c1a96c3c794b8d3663ed)"},{user_id:"ObjectId(6567c1a96c3c794b8d3663ed)"}],
        required: false,
        description: 'Son los user_id de los organizadores del evento.'
    })
    public organizers?: OrganizerDto[]; //user_id[]

    @ApiProperty({
        example: [{user_id: "ObjectId('6317c1a96c3c794b8d3663ed')", accepted: null}, {user_id: "ObjectId('15647c1a96c3c794b8d3663ed')", accepted: true}],
        required: false,
        description: 'Son los user_id de los invitados al evento y su respuesta a la invitación.'
    })
    public guests?: GuestXEventDto[]; //user_id[]

    @ApiProperty({
        example: {name: 'Casamiento',is_private: true, description: 'Fiesta de casamiento privada para más de 300 personas.'},
        required: true,
        description: 'Es el tipo de evento que se llevara a cabo.'
    })
    public type: TypeEventDto;

    @ApiProperty({
        example: [{name: 'Servir comida', in_charge: "ObjectId('6317c1a96c3c794b8d3663ed')", start_date: '2023-09-15', start_time: '22:00:00', end_date: '2023-09-15', end_time: '23:30:00'}, {name: 'Vals', in_charge: "ObjectId('6317c1a96c3c794b8d3663ed')"}],
        required: false,
        description: 'Son las actividades que se llevaran a cabo en el evento.'
    })
    public activities?: ActivityDto[];

    @ApiProperty({
        example: [{name: 'Choripan', description: 'Pan, Chorizo, Salsa criolla, Chimi y Mayonesa', subscribers: [{user_id: "ObjectId('6317c1a96c3c794b8d3663ed')", quantity: 2}, {user_id: "ObjectId('15647c1a96c3c794b8d3663ed')", quantity: 3}]}],
        required: false,
        description: 'Son los consumbiles disponibles en el evento.'
    })
    public consumables?: ConsumableDto[];

    @ApiProperty({
        example: [{name: 'Choripan', description: 'Pan, Chorizo, Salsa criolla, Chimi y Mayonesa', amount: 2500, quantifiable: true, in_charge: "ObjectId('6317c1a96c3c794b8d3663ed')", subscribers: [{user_id: "ObjectId('6317c1a96c3c794b8d3663ed')", quantity: 2}, {user_id: "ObjectId('15647c1a96c3c794b8d3663ed')", quantity: 3}]}],
        required: false,
        description: 'Son los gastos del evento.'
    })
    public expenses?: ExpenseDto[];

    @ApiProperty({
        example: '',
        required: false,
        description: 'Es la foto identificatoria del evento.'
    })
    public event_photo?: string;

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
    
    public ORGANIZER_PERMI;

    public template?: TemplateDto;

    public transports?: TransportDto[];

    public polls?: PollDto[];
}

