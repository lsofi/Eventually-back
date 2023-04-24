import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PollDto } from './dto/poll.dto';
import { PollServiceInterface } from './interface/poll.interface';
import { ConectionRepositoryInterface } from '../../conection-db/conection.repository,interface';
import { EventService } from '../event/event.service';
import { decodeJWT, isEmptyOrNullField } from '../../shared/shared-methods.util';
import { DeletePollDto } from './dto/request/deletePoll.dto';
import { EventRepositoryInterface } from '../../repositories/event/event.repository.interface';
import { RespondPollDto } from './dto/request/respondPoll.dto';

@Injectable()
export class PollService implements PollServiceInterface {
  constructor(
    @Inject('ConectionRepositoryInterface')
    private readonly conectionRepository: ConectionRepositoryInterface,
    private readonly eventServiceInterface: EventService,
    @Inject('EventRepositoryInterface')
    private readonly eventRepositoryInterface: EventRepositoryInterface
  ) { }


  async createPoll(poll: PollDto, jwt: string): Promise<boolean> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, poll.event_id);
    const polls = await this.eventRepositoryInterface.getEventPolls(poll.event_id, permissions, collection);

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede agregar una encuesta a un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (permissions.role_permissions.CREATE_POLL !== true) throw new BadRequestException(['generic#No posee los permisos necesarios para realizar esta acción.']);

    if (polls?.polls?.length >= 1 && permissions.creatorSubscriptionType === 'basic') throw new BadRequestException(['premium#El evento debe ser premium para poder crear más de una encuesta.']);
    if (poll.questions?.length > 10 && permissions.creatorSubscriptionType === 'basic') throw new BadRequestException(['premium#El evento debe ser premium para poder crear una encuesta con más de 10 preguntas.']);

    var crypto = require("crypto");
    poll.poll_id = crypto.randomBytes(12).toString('hex');
    poll.has_answers = false;

    return await this.eventRepositoryInterface.createPoll(poll.event_id, poll, collection);
  }

  async deletePoll(deletePoll: DeletePollDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, deletePoll.event_id);

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede eliminar una encuesta de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (permissions.role_permissions.DELETE_POLL !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.']);

    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.deletePoll(deletePoll.event_id, deletePoll.poll_id, collection);
  }

  async updatePoll(updatePoll: PollDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, updatePoll.event_id);
    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (permissions.role_permissions.UPDATE_POLL !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.'])

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede modificar una encuesta de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    if (updatePoll.questions?.length > 10 && permissions.creatorSubscriptionType === 'basic') throw new BadRequestException(['premium#El evento debe ser premium para poder crear una encuesta con más de 10 preguntas.']);

    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    const poll = await this.getPoll(updatePoll.event_id, updatePoll.poll_id, jwt);
    if (poll.has_answers) throw new BadRequestException(['generic#No se puede modificar una encuesta que tiene respuestas.']);

    return await this.eventRepositoryInterface.updatePoll(updatePoll.event_id, updatePoll, updatePoll.poll_id, collection);
  }

  async getPoll(event_id: string, poll_id: string, jwt: string): Promise<PollDto> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.getPoll(event_id, poll_id, collection);
  }

  async getEventPolls(event_id: string, jwt: string): Promise<PollDto[]> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, event_id);

    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    return await this.eventRepositoryInterface.getEventPolls(event_id, permissions, collection);
  }

  async respondPoll(respondPoll: RespondPollDto, jwt: string): Promise<boolean> {
    const permissions = await this.eventServiceInterface.getAllPermissionsInEvent(jwt, respondPoll.event_id);
    if (isEmptyOrNullField(permissions.role_permissions)) throw new BadRequestException(['generic#El usuario no posee ningun permiso permitido para realizar esta acción.']);
    if (permissions.role_permissions.RESPOND_POLL !== true) throw new BadRequestException(['generic#No posee los permisos suficientes para realizar esta acción.'])

    if (permissions.state == 'canceled' || permissions.state == 'finalized')
      throw new BadRequestException(['generic#No se puede responder una encuesta de un evento que está ' + permissions.state == 'canceled' ? 'cancelado.' : 'finalizado.']);

    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    const user_id = decodeJWT(jwt).sub;

    const poll = await this.eventRepositoryInterface.getQuestions(respondPoll.event_id, respondPoll.poll_id, collection);

    const userRespondPoll = poll.users_answered?.find(x => x === user_id);
    if (!isEmptyOrNullField(userRespondPoll)) throw new BadRequestException(['generic#Ya registramos una respuesta a la encuesta para este usuario.']);
    
    for (const answer of respondPoll.answers) {
      let questionFind = poll.questions.find(x => x.question_id === answer.question_id);
    
      if (isEmptyOrNullField(questionFind.answers)) questionFind.answers = [];
      
      questionFind.answers.push(...answer.answers);
    }

    return await this.eventRepositoryInterface.respondPoll(respondPoll.event_id, respondPoll.poll_id, poll.questions, user_id, collection);
  }

  async getResultPoll(event_id: string, poll_id: string, jwt: string): Promise<any> {
    const db = await this.conectionRepository.conectionToDb();
    const collection = db.collection('Events');

    const poll = await this.eventRepositoryInterface.getQuestions(event_id, poll_id, collection);
    
    let results: any = {
      cant_answers: poll.users_answered?.length,
      questions: []
    }

    //se recorren las preguntas
    for (const question of poll.questions) {
      switch (question.type) {
        case 'multiple_choice_simple':
        case 'multiple_choice_multiple':
          let arrayAcumulador = [];
          //se recorren las posibles respuestas para armar un arreglo que acumule las respuestas a las mismas
          for (const possible_answer of question.possible_answers) {
            arrayAcumulador.push({ answer_id: possible_answer.answer_id, answer: possible_answer.answer, contador: 0 })
          }

          //se recorren las respuestas a la pregunta para ir acumulando los resultados
          for (const answer of question.answers) {
            let acumAnswer = arrayAcumulador.find(x => x.answer_id === answer);
            acumAnswer.contador += 1;
          }

          results.questions.push({ question: question.question, type: question.type, results: arrayAcumulador })
          break;
        case 'text':
          results.questions.push({ question: question.question, type: question.type, results: question.answers })
          break;
        case 'number':
          let objetoAcumulador = { min: question.answers[0], max: question.answers[0], promedio: 0, cantRespuestas: 0 };

          let acumulador = 0;
          //se recorren las respuestas a la pregunta para ir acumulando los resultados
          for (const answer of question.answers) {
            if (answer < objetoAcumulador.min) objetoAcumulador.min = answer;
            if (answer > objetoAcumulador.max) objetoAcumulador.max = answer;

            acumulador += answer;
            objetoAcumulador.cantRespuestas += 1;
            objetoAcumulador.promedio = acumulador / objetoAcumulador.cantRespuestas;
          }

          results.questions.push({ question: question.question, type: question.type, results: objetoAcumulador, mark0: question.mark0, mark100: question.mark100 })
          break;
      }
    }
    return results;
  }
}
