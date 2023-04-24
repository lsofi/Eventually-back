import { ApiProperty } from "@nestjs/swagger";
import { ObjectId } from "mongodb";
import { AddressDto } from "../../../../modules/event/dto/address.dto";

export class UserInCharge{
    user_id: string;
    username: string;
    name: string;
    lastname: string;
}

export class GetServiceDto{
    public service_id: string;

    @ApiProperty({
        example: 'Baños Quimicos',
        required: true,
        description: 'Es el nombre del servicio.'
    })
    public name: string;

    @ApiProperty({
        example: 'Baños quimicos de plastico de 1,4x2 metros.',
        required: false,
        description: 'Es la descripción del servicio.'
    })
    public description?: string;

    @ApiProperty({
        example: 'base64',
        required: true,
        description: 'Es la foto del servicio.'
    })
    public photo?: string;

    @ApiProperty({
        example: 'Disponible todos los dias de la semana a toda hora.',
        required: true,
        description: 'Es la foto del servicio.'
    })
    public availability: string;

    @ApiProperty({
        example: {alias: 'Casa', street: 'San Martin', number: 3645, city: 'Villa Allende', province: 'Córdoba', country: 'Argentina', coordenates: '-31.4035°, -64.206272°'},
        required: true,
        description: 'Es la dirección del prestador de servicio.'
    })
    public address: AddressDto;

    @ApiProperty({
        example: 100,
        required: false,
        description: 'Es el rango en kilometros donde presta el servicio.'
    })
    public range?: number;

    @ApiProperty({
        example: 10000,
        required: false,
        description: 'Es el precio del servicio.'
    })
    public price?: number;

    @ApiProperty({
        example: "Seguridad e higiene",
        required: true,
        description: 'Es el tipo de servicio a brindar.'
    })
    public type: string;

    @ApiProperty({
        example: "Baños quimicos SA",
        required: false,
        description: 'Es un alias opcional que puede utilizar el proveedor de servicios.'
    })
    public providerString?: string;

    @ApiProperty({
        example: "ObjectId(6317c1a96c3c794b8d3663ed)",
        required: false,
        description: 'Es el user_id del proveedor del servicio.'
    })
    public provider?: UserInCharge;

    @ApiProperty({
        example: true,
        required: true,
        description: 'Indica si el servicio está activo para ser visible por el resto de usuarios.'
    })
    public visible: boolean;

    @ApiProperty({
        example: "351 6899668",
        required: true,
        description: 'Es el telefono de contacto del proveedor de servicios.'
    })
    public contact_number: string;

    @ApiProperty({
        example: "bañosquimicos@gmail.com",
        required: false,
        description: 'Es el mail de contacto del proveedor de servicios'
    })
    public contact_email?: string;

    @ApiProperty({
        example: 4,
        required: false,
        description: 'Es la calificación del servicio.'
    })
    public rating?: number;
}