<?php

namespace Ivoz\Provider\Infrastructure\Persistence\Doctrine;

use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NativeQuery;
use Ivoz\Core\Infrastructure\Domain\Service\DoctrineQueryRunner;
use Ivoz\Provider\Domain\Model\DestinationRate\DestinationRate;
use Ivoz\Provider\Domain\Model\DestinationRate\DestinationRateRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * DestinationRateDoctrineRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class DestinationRateDoctrineRepository extends ServiceEntityRepository implements DestinationRateRepository
{
    private $em;
    private $queryRunner;

    public function __construct(
        ManagerRegistry $registry,
        EntityManagerInterface $em,
        DoctrineQueryRunner $queryRunner
    ) {
        parent::__construct($registry, DestinationRate::class);
        $this->em = $em;
        $this->queryRunner = $queryRunner;
    }

    /**
     * @param array $destinationRates
     * @return int affected rows
     * @throws \Doctrine\DBAL\ConnectionException
     * @throws \Doctrine\DBAL\DBALException
     */
    public function insertIgnoreFromArray(array $destinationRates)
    {
        $tpDestinationRateInsert =
            'INSERT INTO DestinationRates'
            . ' (rate, connectFee, rateIncrement, destinationId, destinationRateGroupId)'
            . ' VALUES '
            . implode(",", $destinationRates)
            . ' ON DUPLICATE KEY UPDATE'
            . ' rate = VALUES(rate),'
            . ' connectFee = VALUES(connectFee),'
            . ' rateIncrement = VALUES(rateIncrement)';

        $nativeQuery = new NativeQuery($this->em);
        $nativeQuery->setSQL($tpDestinationRateInsert);

        return $this->queryRunner->execute(
            DestinationRate::class,
            $nativeQuery
        );
    }
}
